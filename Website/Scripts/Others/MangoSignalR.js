/**
 * MangoSignalR.js
 * @param {Object} clientMethods - Object ที่บรรจุฟังก์ชันสำหรับรับค่าจาก Server (เช่น ReceiveNewRow)
 * @param {Function} onStartedCallback - ฟังก์ชันที่จะทำงานเมื่อ SignalR เชื่อมต่อสำเร็จ
 */
let signalR = (clientMethods, onStartedCallback) => {
  clientMethods = clientMethods || {};

  // 1. กำหนดค่าพื้นฐานของ Client Methods (ถ้าไม่มีการส่งมาให้ใช้ค่าพวกนี้)
  let defaultClientMethods = {
    displayMsg: function (msg) {
      console.log("Server message:", msg);
    },
    welcomeMessage: function (text) {
      console.log("SignalR Welcome:", text);
    },
    logout: function () {
      if (window.baseUrl) {
        window.location = window.baseUrl;
      }
    },
    displaySessionOn: function (sessionsOn, sessionsMax) {
      // สำหรับแสดงจำนวน user online (ถ้ามี)
    }
  };

  // 2. Merge clientMethods ที่ส่งมาจากหน้าจอ เข้ากับ default
  // ใช้ $linq หรือ Object.assign ก็ได้
  Object.keys(clientMethods).forEach(key => {
    defaultClientMethods[key] = clientMethods[key];
  });

  // 3. ดึง Hub Proxy จากระบบ (SJ.iwc.SignalR คือตัวจัดการ shared connection)
  let hubProxy = SJ.iwc.SignalR;

  // 4. สร้าง Hub Proxy เฉพาะของ 'socketHub'
  let reHub = hubProxy.getHubProxy('socketHub', {
    client: defaultClientMethods
  });

  // 5. สร้าง Object สำหรับจัดการ Loop และสถานะ
  let signalrObj = {
    check_session_loop: null,
    check_state_loop: null,

    start: function (fn) {
      hubProxy.start().done(function () {
        console.log('SignalR Service Started');
        if (fn) fn();
      }).fail(function (err) {
        console.error('SignalR Could not connect:', err);
      });
    },

    check_session: function (fn) {
      // ตัวอย่างการเรียกใช้ Method บน Server (ถ้าต้องการ)
      // reHub.server.userOnlineStatus(...);
    }
  };

  // --- Event: เมื่อเชื่อมต่อสำเร็จ ---
  hubProxy.on('connected', function () {
    let isOwner = hubProxy.isConnectionOwner();
    console.log('SignalR Connected (IsOwner: ' + isOwner + ')');

    if (isOwner) {
      // ถ้าเป็น Tab หลัก ให้เริ่มระบบเช็ค Session
      signalrObj.check_session();

      // *** จุดสำคัญ ***: เรียก Callback ที่ส่งมาจากหน้าจอ (เพื่อสั่ง Join Group)
      if (onStartedCallback) {
        onStartedCallback();
      }
    } else {
      // ถ้าไม่ใช่ Tab หลัก (แชร์ connection) แต่หน้าจอก็ต้องการเข้า Group ด้วย
      // ให้รัน Callback เช่นกันเพื่อให้แน่ใจว่าได้รับข้อมูล
      if (onStartedCallback) {
        onStartedCallback();
      }
    }

    // จัดการ Loop ตรวจสอบสถานะ
    if (!signalrObj.check_session_loop && isOwner) {
      signalrObj.check_session_loop = setInterval(function () {
        signalrObj.check_session();
      }, 60000);
    }
  });

  // --- Event: เมื่อการเชื่อมต่อขาดหาย ---
  hubProxy.on('disconnected', function () {
    console.warn('SignalR Disconnected');
    if (signalrObj.check_session_loop) {
      clearInterval(signalrObj.check_session_loop);
      signalrObj.check_session_loop = null;
    }

    // ระบบ Reconnect อัตโนมัติ (เฉพาะ Owner)
    if (hubProxy.isConnectionOwner()) {
      if (!signalrObj.check_state_loop) {
        signalrObj.check_state_loop = setInterval(function () {
          if (hubProxy.getState() === 4) { // 4 = Disconnected
            console.log('SignalR Attempting to reconnect...');
            signalrObj.start();
          } else {
            clearInterval(signalrObj.check_state_loop);
            signalrObj.check_state_loop = null;
          }
        }, 30000);
      }
    }
  });

  // สั่งเริ่มทำงานครั้งแรก
  signalrObj.start();

  return { reHub, hubProxy };
};
