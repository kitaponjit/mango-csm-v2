<template>
  <transition name="fade">
    <div v-if="isActive" class="loading-overlay">
      <div class="loading-card">

        <div class="stage">
          <div class="sparkles">
            <i v-for="n in 6" :key="'sp' + n"></i>
          </div>

          <!-- อนิเมะ 1: มะม่วงเดิน -->
          <div class="mango-wrap" v-if="animType === 1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="80" height="100">
              <ellipse cx="60" cy="145" rx="24" ry="5" fill="rgba(0,0,0,0.10)" class="shadow-anim"/>
              <rect x="57" y="8" width="6" height="15" rx="3" fill="#7C6A62" transform="rotate(-8 60 15)"/>
              <ellipse cx="44" cy="12" rx="17" ry="7.5" fill="#8FB892" transform="rotate(-35 44 12)"/>
              <line x1="44" y1="12" x2="56" y2="20" stroke="#7BA47E" stroke-width="1.2" stroke-linecap="round"/>
              <ellipse cx="77" cy="10" rx="18" ry="7.5" fill="#A8C8AA" transform="rotate(25 77 10)"/>
              <line x1="77" y1="10" x2="63" y2="20" stroke="#7BA47E" stroke-width="1.2" stroke-linecap="round"/>

              <g class="squish">
                <ellipse cx="60" cy="80" rx="44" ry="46" fill="#E9AB68"/>
                <ellipse cx="60" cy="64" rx="40" ry="36" fill="#F0C48F"/>
                <ellipse cx="60" cy="102" rx="38" ry="25" fill="#D9924A" opacity="0.32"/>
                <ellipse cx="40" cy="56" rx="12" ry="17" fill="rgba(255,255,255,0.20)" transform="rotate(-20 40 56)"/>
                <circle cx="29" cy="74" r="4.5" fill="rgba(255,255,255,0.16)"/>
                <ellipse cx="27" cy="90" rx="10" ry="6.5" fill="#E0A08D" opacity="0.5"/>
                <ellipse cx="93" cy="90" rx="10" ry="6.5" fill="#E0A08D" opacity="0.5"/>
                <g class="eyes">
                  <circle cx="44" cy="76" r="8" fill="#5D4037"/>
                  <circle cx="76" cy="76" r="8" fill="#5D4037"/>
                  <circle cx="46.6" cy="72.8" r="2.9" fill="#F7F4EE"/>
                  <circle cx="78.6" cy="72.8" r="2.9" fill="#F7F4EE"/>
                  <circle cx="41.6" cy="79.4" r="1.4" fill="#F7F4EE" opacity="0.7"/>
                  <circle cx="73.6" cy="79.4" r="1.4" fill="#F7F4EE" opacity="0.7"/>
                </g>
                <path d="M50 92 Q55 99 60 92 Q65 99 70 92" stroke="#5D4037" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </g>

              <g class="arm-l">
                <path d="M18 82 Q6 72 10 60" stroke="#D9924A" stroke-width="8" fill="none" stroke-linecap="round"/>
                <circle cx="9" cy="57" r="5.5" fill="#E9AB68"/>
              </g>
              <g class="arm-r">
                <path d="M102 82 Q114 72 110 60" stroke="#D9924A" stroke-width="8" fill="none" stroke-linecap="round"/>
                <circle cx="111" cy="57" r="5.5" fill="#E9AB68"/>
              </g>
              <g class="leg-l">
                <rect x="44" y="124" width="12" height="16" rx="6" fill="#7C6A62"/>
                <ellipse cx="50" cy="141" rx="10" ry="4.5" fill="#5D4037"/>
              </g>
              <g class="leg-r">
                <rect x="64" y="124" width="12" height="16" rx="6" fill="#7C6A62"/>
                <ellipse cx="70" cy="141" rx="10" ry="4.5" fill="#5D4037"/>
              </g>
            </svg>
          </div>

          <!-- อนิเมะ 2: มะม่วงเขียนหนังสือ -->
          <div class="mango-writing" v-if="animType === 2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 168" width="140" height="130">
              <!-- Shadow -->
              <ellipse cx="90" cy="160" rx="36" ry="5" fill="rgba(0,0,0,0.08)"/>

              <!-- Desk -->
              <rect x="28" y="124" width="124" height="9" rx="4.5" fill="#A48C74"/>
              <rect x="36" y="133" width="7" height="26" rx="3.5" fill="#8D6E63"/>
              <rect x="137" y="133" width="7" height="26" rx="3.5" fill="#8D6E63"/>

              <!-- Notebook on desk -->
              <rect x="48" y="110" width="54" height="15" rx="4" fill="#FBFAF6" stroke="#EDDCC2" stroke-width="1.4"/>
              <line x1="56" y1="114" x2="94" y2="114" stroke="#CBD9E3" stroke-width="1"/>
              <line x1="56" y1="117.5" x2="89" y2="117.5" stroke="#CBD9E3" stroke-width="1"/>
              <line x1="56" y1="121" x2="82" y2="121" stroke="#CBD9E3" stroke-width="1"/>
              <!-- Notebook spiral -->
              <circle cx="50" cy="114" r="1.5" fill="#E9AB68"/>
              <circle cx="50" cy="117.5" r="1.5" fill="#E9AB68"/>
              <circle cx="50" cy="121" r="1.5" fill="#E9AB68"/>

              <!-- Writing lines appearing animation -->
              <g class="writing-lines">
                <line x1="56" y1="114" x2="94" y2="114" stroke="#7096B8" stroke-width="1" stroke-linecap="round" stroke-dasharray="38" stroke-dashoffset="38" class="write-line-1"/>
                <line x1="56" y1="117.5" x2="89" y2="117.5" stroke="#7096B8" stroke-width="1" stroke-linecap="round" stroke-dasharray="33" stroke-dashoffset="33" class="write-line-2"/>
                <line x1="56" y1="121" x2="82" y2="121" stroke="#7096B8" stroke-width="1" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="26" class="write-line-3"/>
              </g>

              <!-- Body -->
              <ellipse cx="90" cy="80" rx="34" ry="37" fill="#E9AB68"/>
              <ellipse cx="90" cy="68" rx="30" ry="29" fill="#F0C48F"/>
              <ellipse cx="90" cy="98" rx="27" ry="18" fill="#D9924A" opacity="0.28"/>

              <!-- Stem & Leaf -->
              <rect x="87" y="20" width="5" height="12" rx="2.5" fill="#7C6A62" transform="rotate(-6 89 26)"/>
              <ellipse cx="77" cy="22" rx="12" ry="5.5" fill="#8FB892" transform="rotate(-30 77 22)"/>
              <ellipse cx="101" cy="20" rx="13" ry="5.5" fill="#A8C8AA" transform="rotate(20 101 20)"/>

              <!-- Highlight -->
              <ellipse cx="73" cy="58" rx="10" ry="13" fill="rgba(255,255,255,0.20)" transform="rotate(-18 73 58)"/>
              <circle cx="64" cy="74" r="3.6" fill="rgba(255,255,255,0.15)"/>

              <!-- Blush -->
              <ellipse cx="65" cy="82" rx="7.5" ry="5" fill="#E0A08D" opacity="0.5"/>
              <ellipse cx="115" cy="82" rx="7.5" ry="5" fill="#E0A08D" opacity="0.5"/>

              <!-- Eyes (focused, looking down at notebook) -->
              <g class="eyes">
                <circle cx="80" cy="72" r="6.5" fill="#5D4037"/>
                <circle cx="100" cy="72" r="6.5" fill="#5D4037"/>
                <circle cx="82.2" cy="69.4" r="2.4" fill="#F7F4EE"/>
                <circle cx="102.2" cy="69.4" r="2.4" fill="#F7F4EE"/>
                <circle cx="78" cy="74.6" r="1.2" fill="#F7F4EE" opacity="0.7"/>
                <circle cx="98" cy="74.6" r="1.2" fill="#F7F4EE" opacity="0.7"/>
              </g>

              <!-- Mouth (small, focused) -->
              <path d="M84 88 Q90 94 96 88 Z" fill="#7B4B3A"/>
              <path d="M87.5 91.4 Q90 94.6 92.5 91.4 Z" fill="#DE958E"/>

              <!-- Focus sparkles -->
              <g class="think-spark">
                <path d="M132 40 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z" fill="#E4C878"/>
              </g>
              <g class="think-spark think-spark-2">
                <path d="M46 58 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z" fill="#DFB0A0"/>
              </g>

              <!-- Left arm on desk -->
              <path d="M60 90 Q52 100 56 112" stroke="#D9924A" stroke-width="7" fill="none" stroke-linecap="round"/>
              <circle cx="56" cy="113" r="4.5" fill="#E9AB68"/>

              <!-- Right arm with pencil (writing) -->
              <g class="pencil-arm">
                <path d="M120 90 Q126 100 110 112" stroke="#D9924A" stroke-width="7" fill="none" stroke-linecap="round"/>
                <circle cx="109" cy="112" r="4.5" fill="#E9AB68"/>
                <!-- Pencil -->
                <g transform="rotate(-35 108 110)">
                  <rect x="105" y="86" width="6" height="22" rx="2.5" fill="#E4C878"/>
                  <rect x="105" y="86" width="6" height="5" rx="2.5" fill="#DE958E"/>
                  <polygon points="105,108 111,108 108,116" fill="#EDDCC2"/>
                  <polygon points="106.6,112 109.4,112 108,116" fill="#5D4037"/>
                </g>
              </g>

              <!-- Feet under desk -->
              <ellipse cx="79" cy="154" rx="9" ry="4.5" fill="#7C6A62"/>
              <ellipse cx="101" cy="154" rx="9" ry="4.5" fill="#7C6A62"/>
            </svg>
          </div>

          <!-- อนิเมะ 3: มะม่วง 3 ผลทำท่าเคารพ -->
          <div class="mango-salute" v-if="animType === 3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 152" width="196" height="124">

              <!-- === มะม่วงผล 1 (ซ้าย) === -->
              <g transform="translate(0 0)">
                <g class="salute-bob salute-bob-1">
                  <ellipse cx="50" cy="141" rx="18" ry="4.5" fill="rgba(0,0,0,0.08)"/>
                  <rect x="47.8" y="58" width="4.5" height="10" rx="2.2" fill="#7C6A62" transform="rotate(-6 50 63)"/>
                  <ellipse cx="42" cy="60" rx="10" ry="4.5" fill="#8FB892" transform="rotate(-30 42 60)"/>
                  <ellipse cx="59" cy="59" rx="10.5" ry="4.5" fill="#A8C8AA" transform="rotate(20 59 59)"/>
                  <ellipse cx="50" cy="102" rx="25" ry="27" fill="#E9AB68"/>
                  <ellipse cx="50" cy="92" rx="22" ry="21" fill="#F0C48F"/>
                  <ellipse cx="50" cy="116" rx="20" ry="13" fill="#D9924A" opacity="0.28"/>
                  <ellipse cx="39" cy="88" rx="6.5" ry="9" fill="rgba(255,255,255,0.19)" transform="rotate(-18 39 88)"/>
                  <ellipse cx="33" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <ellipse cx="67" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <g class="eyes">
                    <circle cx="42" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="58" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="43.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="59.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="40.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                    <circle cx="56.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                  </g>
                  <path d="M44 107 Q50 114 56 107 Z" fill="#7B4B3A"/>
                  <path d="M47.6 110.6 Q50 114 52.4 110.6 Z" fill="#DE958E"/>
                  <!-- Salute arm (right) -->
                  <g class="salute-hand">
                    <path d="M70 100 Q80 90 76 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="76" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Left arm down -->
                  <g class="salute-hand salute-hand-l">
                    <path d="M30 100 Q20 90 24 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="24" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Feet -->
                  <ellipse cx="43" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                  <ellipse cx="57" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                </g>
                <path class="cheer-heart" d="M50 44 c-2.6 -3.4 -8 -1.4 -8 3 0 3.8 5 7 8 9.4 3 -2.4 8 -5.6 8 -9.4 0 -4.4 -5.4 -6.4 -8 -3 z" fill="#DE958E"/>
              </g>

              <!-- === มะม่วงผล 2 (กลาง) === -->
              <g transform="translate(70 0)">
                <g class="salute-bob salute-bob-2">
                  <ellipse cx="50" cy="141" rx="18" ry="4.5" fill="rgba(0,0,0,0.08)"/>
                  <rect x="47.8" y="58" width="4.5" height="10" rx="2.2" fill="#7C6A62" transform="rotate(-6 50 63)"/>
                  <ellipse cx="42" cy="60" rx="10" ry="4.5" fill="#8FB892" transform="rotate(-30 42 60)"/>
                  <ellipse cx="59" cy="59" rx="10.5" ry="4.5" fill="#A8C8AA" transform="rotate(20 59 59)"/>
                  <ellipse cx="50" cy="102" rx="25" ry="27" fill="#E9AB68"/>
                  <ellipse cx="50" cy="92" rx="22" ry="21" fill="#F0C48F"/>
                  <ellipse cx="50" cy="116" rx="20" ry="13" fill="#D9924A" opacity="0.28"/>
                  <ellipse cx="39" cy="88" rx="6.5" ry="9" fill="rgba(255,255,255,0.19)" transform="rotate(-18 39 88)"/>
                  <ellipse cx="33" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <ellipse cx="67" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <g class="eyes">
                    <circle cx="42" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="58" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="43.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="59.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="40.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                    <circle cx="56.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                  </g>
                  <path d="M44 107 Q50 114 56 107 Z" fill="#7B4B3A"/>
                  <path d="M47.6 110.6 Q50 114 52.4 110.6 Z" fill="#DE958E"/>
                  <!-- Salute arm (right) -->
                  <g class="salute-hand">
                    <path d="M70 100 Q80 90 76 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="76" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Left arm down -->
                  <g class="salute-hand salute-hand-l">
                    <path d="M30 100 Q20 90 24 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="24" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Feet -->
                  <ellipse cx="43" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                  <ellipse cx="57" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                </g>
                <path class="cheer-heart cheer-heart-2" d="M50 44 c-2.6 -3.4 -8 -1.4 -8 3 0 3.8 5 7 8 9.4 3 -2.4 8 -5.6 8 -9.4 0 -4.4 -5.4 -6.4 -8 -3 z" fill="#E9BC85"/>
              </g>

              <!-- === มะม่วงผล 3 (ขวา) === -->
              <g transform="translate(140 0)">
                <g class="salute-bob salute-bob-3">
                  <ellipse cx="50" cy="141" rx="18" ry="4.5" fill="rgba(0,0,0,0.08)"/>
                  <rect x="47.8" y="58" width="4.5" height="10" rx="2.2" fill="#7C6A62" transform="rotate(-6 50 63)"/>
                  <ellipse cx="42" cy="60" rx="10" ry="4.5" fill="#8FB892" transform="rotate(-30 42 60)"/>
                  <ellipse cx="59" cy="59" rx="10.5" ry="4.5" fill="#A8C8AA" transform="rotate(20 59 59)"/>
                  <ellipse cx="50" cy="102" rx="25" ry="27" fill="#E9AB68"/>
                  <ellipse cx="50" cy="92" rx="22" ry="21" fill="#F0C48F"/>
                  <ellipse cx="50" cy="116" rx="20" ry="13" fill="#D9924A" opacity="0.28"/>
                  <ellipse cx="39" cy="88" rx="6.5" ry="9" fill="rgba(255,255,255,0.19)" transform="rotate(-18 39 88)"/>
                  <ellipse cx="33" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <ellipse cx="67" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                  <g class="eyes">
                    <circle cx="42" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="58" cy="98" r="5.2" fill="#5D4037"/>
                    <circle cx="43.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="59.8" cy="95.9" r="1.9" fill="#F7F4EE"/>
                    <circle cx="40.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                    <circle cx="56.4" cy="100.2" r="1" fill="#F7F4EE" opacity="0.7"/>
                  </g>
                  <path d="M44 107 Q50 114 56 107 Z" fill="#7B4B3A"/>
                  <path d="M47.6 110.6 Q50 114 52.4 110.6 Z" fill="#DE958E"/>
                  <!-- Salute arm (right) -->
                  <g class="salute-hand">
                    <path d="M70 100 Q80 90 76 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="76" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Left arm down -->
                  <g class="salute-hand salute-hand-l">
                    <path d="M30 100 Q20 90 24 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                    <circle cx="24" cy="77" r="4" fill="#E9AB68"/>
                  </g>
                  <!-- Feet -->
                  <ellipse cx="43" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                  <ellipse cx="57" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                </g>
                <path class="cheer-heart cheer-heart-3" d="M50 44 c-2.6 -3.4 -8 -1.4 -8 3 0 3.8 5 7 8 9.4 3 -2.4 8 -5.6 8 -9.4 0 -4.4 -5.4 -6.4 -8 -3 z" fill="#AFC8B0"/>
              </g>

            </svg>
          </div>

          <!-- อนิเมะ 4: หนูหมวกสิงโตเต้นดีใจคู่กับมะม่วง -->
          <div class="mango-dance" v-if="animType === 4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 152" width="200" height="125">

              <!-- Music notes -->
              <g class="note note-1">
                <ellipse cx="10" cy="46" rx="5.5" ry="4.2" fill="#8578A8" transform="rotate(-20 10 46)"/>
                <rect x="13.6" y="28" width="2.6" height="19" rx="1.3" fill="#8578A8"/>
                <path d="M16.2 28 q7 2 7 7 q-3 -4 -7 -4 z" fill="#8578A8"/>
              </g>
              <g class="note note-2">
                <ellipse cx="224" cy="52" rx="5" ry="3.8" fill="#5F9992" transform="rotate(-20 224 52)"/>
                <rect x="227.3" y="36" width="2.4" height="17" rx="1.2" fill="#5F9992"/>
                <path d="M229.7 36 q6.5 2 6.5 6.5 q-2.8 -3.6 -6.5 -3.6 z" fill="#5F9992"/>
              </g>

              <!-- Heart between the pair -->
              <path class="duo-heart" d="M128 36 c-3 -4 -9.4 -1.7 -9.4 3.5 0 4.4 5.9 8.2 9.4 11 3.5 -2.8 9.4 -6.6 9.4 -11 0 -5.2 -6.4 -7.5 -9.4 -3.5 z" fill="#DE958E"/>

              <!-- === หนูหมวกสิงโต (ซ้าย) === -->
              <g transform="translate(3 -9.6) scale(0.86)">
                <ellipse cx="80" cy="174" rx="30" ry="5" fill="rgba(0,0,0,0.10)" class="dance-shadow"/>

                <g class="hop-a">
                  <!-- Body -->
                  <g class="dance-body">
                    <ellipse cx="80" cy="142" rx="27" ry="29" fill="#C6CFD3"/>
                    <path d="M61 126 L80 146 L99 126 L100 160 Q80 172 60 160 Z" fill="#8B9CA6"/>
                    <path d="M61 126 L80 146 L99 126" stroke="#E4E8EA" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
                    <circle cx="80" cy="156" r="3.4" fill="#E4E8EA"/>

                    <!-- Feet -->
                    <ellipse cx="67" cy="170" rx="11" ry="6" fill="#A9B5BB"/>
                    <ellipse cx="93" cy="170" rx="11" ry="6" fill="#A9B5BB"/>

                    <!-- Arms -->
                    <g class="dance-arm-l">
                      <path d="M58 132 Q44 124 40 108" stroke="#C6CFD3" stroke-width="11" fill="none" stroke-linecap="round"/>
                      <circle cx="39" cy="106" r="7" fill="#E4E8EA"/>
                    </g>
                    <g class="dance-arm-r">
                      <path d="M102 132 Q116 124 120 108" stroke="#C6CFD3" stroke-width="11" fill="none" stroke-linecap="round"/>
                      <circle cx="121" cy="106" r="7" fill="#E4E8EA"/>
                    </g>
                  </g>

                  <!-- Head + lion hood -->
                  <g class="dance-head">
                    <!-- Mane -->
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(0 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(30 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(60 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(90 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(120 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(150 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(180 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(210 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(240 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(270 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#D9924A" transform="rotate(300 80 78)"/>
                    <ellipse cx="80" cy="35" rx="14" ry="11" fill="#E9BC85" transform="rotate(330 80 78)"/>

                    <!-- Hood lining -->
                    <circle cx="80" cy="78" r="41" fill="#EDDCC2"/>

                    <!-- Ears -->
                    <circle cx="54" cy="48" r="14" fill="#C6CFD3"/>
                    <circle cx="54" cy="48" r="8.5" fill="#E4C0CC"/>
                    <circle cx="106" cy="48" r="14" fill="#C6CFD3"/>
                    <circle cx="106" cy="48" r="8.5" fill="#E4C0CC"/>

                    <!-- Face -->
                    <circle cx="80" cy="78" r="37" fill="#C6CFD3"/>
                    <ellipse cx="80" cy="94" rx="18" ry="12" fill="#E4E8EA"/>
                    <ellipse cx="68" cy="62" rx="10" ry="7" fill="rgba(255,255,255,0.24)" transform="rotate(-20 68 62)"/>

                    <!-- Blush -->
                    <ellipse cx="55" cy="92" rx="8.5" ry="5.5" fill="#D9A0B2" opacity="0.55"/>
                    <ellipse cx="105" cy="92" rx="8.5" ry="5.5" fill="#D9A0B2" opacity="0.55"/>

                    <!-- Eyes -->
                    <g class="eyes">
                      <ellipse cx="66" cy="80" rx="7" ry="8.5" fill="#3C4A52"/>
                      <ellipse cx="94" cy="80" rx="7" ry="8.5" fill="#3C4A52"/>
                      <circle cx="68.4" cy="76.6" r="2.8" fill="#F7F4EE"/>
                      <circle cx="96.4" cy="76.6" r="2.8" fill="#F7F4EE"/>
                      <circle cx="63.6" cy="83.4" r="1.3" fill="#F7F4EE" opacity="0.7"/>
                      <circle cx="91.6" cy="83.4" r="1.3" fill="#F7F4EE" opacity="0.7"/>
                    </g>

                    <!-- Nose & mouth -->
                    <ellipse cx="80" cy="90" rx="4.6" ry="3.4" fill="#5E6E77"/>
                    <path d="M80 93.4 L80 96" stroke="#5E6E77" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M80 96 Q74 102 69 97" stroke="#5E6E77" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M80 96 Q86 102 91 97" stroke="#5E6E77" stroke-width="2" fill="none" stroke-linecap="round"/>
                  </g>
                </g>
              </g>

              <!-- === มะม่วงคู่เต้น (ขวา) === -->
              <g transform="translate(117 -34) scale(1.28)">
                <ellipse cx="50" cy="136" rx="18" ry="4.5" fill="rgba(0,0,0,0.10)" class="dance-shadow-b"/>

                <g class="hop-b">
                  <g class="dance-mango-body">
                    <rect x="47.8" y="58" width="4.5" height="10" rx="2.2" fill="#7C6A62" transform="rotate(-6 50 63)"/>
                    <ellipse cx="42" cy="60" rx="10" ry="4.5" fill="#8FB892" transform="rotate(-30 42 60)"/>
                    <ellipse cx="59" cy="59" rx="10.5" ry="4.5" fill="#A8C8AA" transform="rotate(20 59 59)"/>
                    <ellipse cx="50" cy="102" rx="25" ry="27" fill="#E9AB68"/>
                    <ellipse cx="50" cy="92" rx="22" ry="21" fill="#F0C48F"/>
                    <ellipse cx="50" cy="116" rx="20" ry="13" fill="#D9924A" opacity="0.28"/>
                    <ellipse cx="39" cy="88" rx="6.5" ry="9" fill="rgba(255,255,255,0.19)" transform="rotate(-18 39 88)"/>
                    <ellipse cx="33" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                    <ellipse cx="67" cy="105" rx="6.5" ry="4.5" fill="#E0A08D" opacity="0.5"/>
                    <path d="M37 99 Q42 93 47 99" stroke="#5D4037" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    <path d="M53 99 Q58 93 63 99" stroke="#5D4037" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    <path d="M44 107 Q50 114 56 107 Z" fill="#7B4B3A"/>
                    <path d="M47.6 110.6 Q50 114 52.4 110.6 Z" fill="#DE958E"/>

                    <!-- Feet -->
                    <ellipse cx="43" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>
                    <ellipse cx="57" cy="131" rx="8" ry="4.5" fill="#7C6A62"/>

                    <!-- Arms -->
                    <g class="dance-arm-ml">
                      <path d="M30 100 Q20 90 24 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                      <circle cx="24" cy="77" r="4" fill="#E9AB68"/>
                    </g>
                    <g class="dance-arm-mr">
                      <path d="M70 100 Q80 90 76 79" stroke="#D9924A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                      <circle cx="76" cy="77" r="4" fill="#E9AB68"/>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>

          <!-- Ground dashes (only for anim 1) -->
          <div class="ground-dashes" v-if="animType === 1">
            <span v-for="n in 8" :key="n"></span>
          </div>
        </div>

        <p class="loading-text">MANGO CSM</p>
        <p class="loading-sub">Customer Service Management</p>
        <div class="dots">
          <span></span><span></span><span></span>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
  let process = false;
  let loadingBox = {
    data() {
      return {
        isActive: false,
        animType: 1
      }
    },
    methods: {
      is_mango() {
        const list = (this.$store && this.$store.state.configData) || []
        const cfg = list.find(x => x.config_id === 'TRN0001')
        return cfg?.config_value === 'Y'
      },
      show() {
        const total = this.is_mango() ? 4 : 3;
        this.animType = Math.floor(Math.random() * total) + 1;
        this.isActive = true;
      },
      hide() { this.isActive = false; },
      hidden(fn) { this.isActive = false; if (fn) fn(); }
    }
  };
  export default loadingBox;
</script>

<style scoped>
/* ── Overlay ── */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 110% at 50% 42%, rgba(255, 248, 233, 0.88), rgba(176, 203, 238, 0.78) 62%);
  backdrop-filter: blur(8px) saturate(1.05);
  -webkit-backdrop-filter: blur(8px) saturate(1.05);
}

/* โหมดมืดใช้โทนกรมท่าที่ยกให้สว่างขึ้น ไม่ทึบเท่าเดิม */
body.dark-mode .loading-overlay {
  background: radial-gradient(120% 110% at 50% 42%, rgba(64, 92, 132, 0.50), rgba(22, 40, 66, 0.64) 62%);
}

/* ── Card ── */
.loading-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(165deg, #FFFDF7 0%, #FFF3DE 56%, #FFE6C4 100%);
  border: 3px solid #FFFFFF;
  border-radius: 34px;
  padding: 18px 46px 20px;
  box-shadow:
    0 0 0 6px rgba(240, 164, 74, 0.30),
    0 0 0 13px rgba(240, 164, 74, 0.12),
    0 20px 46px rgba(180, 104, 30, 0.22),
    inset 0 -7px 0 rgba(217, 146, 74, 0.16);
  min-width: 240px;
  animation: card-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.loading-card::before,
.loading-card::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: #F0A83E;
  opacity: 0.85;
}
.loading-card::before { top: 16px; left: 18px; width: 9px; height: 9px; }
.loading-card::after  { bottom: 20px; right: 20px; width: 7px; height: 7px; background: #5FAE6E; }

@keyframes card-pop {
  0%   { transform: scale(0.82) translateY(14px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* ── Stage ── */
.stage {
  position: relative;
  width: 210px;
  height: 132px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  filter: saturate(1.22);
}

/* วงแสงสีหลังตัวละคร ให้ตัวการ์ตูนเด้งออกจากพื้นครีม */
.stage::before {
  content: '';
  position: absolute;
  left: -8%;
  right: -8%;
  top: 2%;
  bottom: -14%;
  background:
    radial-gradient(58% 62% at 50% 58%, rgba(255, 193, 94, 0.55), rgba(255, 193, 94, 0) 72%),
    radial-gradient(42% 46% at 22% 34%, rgba(139, 197, 148, 0.34), rgba(139, 197, 148, 0) 70%),
    radial-gradient(42% 46% at 80% 30%, rgba(240, 141, 132, 0.30), rgba(240, 141, 132, 0) 70%);
  pointer-events: none;
}

/* ── Sparkles ── */
.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.sparkles i {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #F5B92E;
  clip-path: polygon(50% 0, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0 50%, 42% 42%);
  opacity: 0;
  animation: twinkle 2.6s ease-in-out infinite;
}
.sparkles i:nth-child(1) { top: 10px;  left: 14px;  animation-delay: 0s; }
.sparkles i:nth-child(2) { top: 28px;  right: 20px; animation-delay: 0.5s; background: #F0796D; }
.sparkles i:nth-child(3) { top: 4px;   left: 52%;   animation-delay: 1s;   width: 7px; height: 7px; }
.sparkles i:nth-child(4) { bottom: 34px; left: 8px;  animation-delay: 1.5s; width: 7px; height: 7px; background: #6FB87A; }
.sparkles i:nth-child(5) { top: 52px;  right: 6px;  animation-delay: 2s;   width: 8px; height: 8px; }
.sparkles i:nth-child(6) { bottom: 22px; right: 40px; animation-delay: 0.8s; width: 6px; height: 6px; background: #F0796D; }

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  50%      { opacity: 0.95; transform: scale(1) rotate(90deg); }
}

/* ── Blink (ใช้ร่วมทุกอนิเมะ) ── */
.eyes {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: blink 4s ease-in-out infinite;
}
@keyframes blink {
  0%, 91%, 100% { transform: scaleY(1); }
  94%, 96%      { transform: scaleY(0.1); }
}

/* ══════════════════════════════════════════════
   อนิเมะ 1: มะม่วงเดิน
   ══════════════════════════════════════════════ */
.mango-wrap {
  position: absolute;
  bottom: 12px;
  animation:
    walk-x  3.2s linear infinite,
    hop     0.42s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

@keyframes walk-x {
  0%   { left: -86px; }
  100% { left: 218px; }
}

@keyframes hop {
  0%   { bottom: 12px; }
  100% { bottom: 22px; }
}

.squish {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: squish 0.42s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}
@keyframes squish {
  0%   { transform: scale(1.06, 0.94); }
  100% { transform: scale(0.96, 1.04); }
}

.shadow-anim {
  animation: shadow-breath 0.42s ease-in-out infinite alternate;
}
@keyframes shadow-breath {
  0%   { rx: 24; opacity: 0.12; }
  100% { rx: 14; opacity: 0.04; }
}

.arm-l {
  transform-origin: 18px 82px;
  animation: arm-l 0.42s ease-in-out infinite alternate;
}
.arm-r {
  transform-origin: 102px 82px;
  animation: arm-r 0.42s ease-in-out infinite alternate;
}
@keyframes arm-l {
  0%   { transform: rotate(-26deg); }
  100% { transform: rotate(26deg); }
}
@keyframes arm-r {
  0%   { transform: rotate(26deg); }
  100% { transform: rotate(-26deg); }
}

.leg-l {
  transform-origin: 50px 124px;
  animation: leg-l 0.42s ease-in-out infinite alternate;
}
.leg-r {
  transform-origin: 70px 124px;
  animation: leg-r 0.42s ease-in-out infinite alternate;
}
@keyframes leg-l {
  0%   { transform: rotate(-24deg); }
  100% { transform: rotate(24deg); }
}
@keyframes leg-r {
  0%   { transform: rotate(24deg); }
  100% { transform: rotate(-24deg); }
}

.ground-dashes {
  position: absolute;
  bottom: 4px;
  left: 0;
  display: flex;
  gap: 20px;
  animation: dash-scroll 0.5s linear infinite;
}
.ground-dashes span {
  display: inline-block;
  width: 26px;
  height: 5px;
  background: #F0C48F;
  border-radius: 3px;
  flex-shrink: 0;
}
@keyframes dash-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-46px); }
}

/* ══════════════════════════════════════════════
   อนิเมะ 2: มะม่วงเขียนหนังสือ
   ══════════════════════════════════════════════ */
.mango-writing {
  animation: writing-bob 1.5s ease-in-out infinite alternate;
}

@keyframes writing-bob {
  0%   { transform: translateY(0) rotate(-1deg); }
  100% { transform: translateY(-4px) rotate(1deg); }
}

.pencil-arm {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: pencil-write 0.36s ease-in-out infinite alternate;
}
@keyframes pencil-write {
  0%   { transform: rotate(-3deg) translateX(-2px); }
  100% { transform: rotate(3deg) translateX(2px); }
}

.think-spark {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: spark-pop 1.8s ease-in-out infinite;
}
.think-spark-2 { animation-delay: 0.9s; }
@keyframes spark-pop {
  0%, 100% { transform: scale(0.2) rotate(-30deg); opacity: 0; }
  40%, 60% { transform: scale(1) rotate(20deg); opacity: 0.85; }
}

.writing-lines .write-line-1 {
  animation: draw-line 2s ease-in-out infinite;
}
.writing-lines .write-line-2 {
  animation: draw-line 2s ease-in-out infinite;
  animation-delay: 0.6s;
}
.writing-lines .write-line-3 {
  animation: draw-line 2s ease-in-out infinite;
  animation-delay: 1.2s;
}
@keyframes draw-line {
  0%   { stroke-dashoffset: 38; }
  50%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}

/* ══════════════════════════════════════════════
   อนิเมะ 3: มะม่วง 3 ผลเคารพ
   ══════════════════════════════════════════════ */
.mango-salute {
  animation: salute-enter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes salute-enter {
  0%   { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.salute-bob {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: salute-bob-anim 0.7s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}
.salute-bob-1 { animation-delay: 0s; }
.salute-bob-2 { animation-delay: 0.14s; }
.salute-bob-3 { animation-delay: 0.28s; }

@keyframes salute-bob-anim {
  0%   { transform: translateY(0) scale(1.03, 0.97); }
  100% { transform: translateY(-7px) scale(0.98, 1.02); }
}

.salute-hand {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: salute-wave 0.36s ease-in-out infinite alternate;
}
.salute-hand-l {
  animation-name: salute-wave-l;
}
@keyframes salute-wave {
  0%   { transform: rotate(-14deg); }
  100% { transform: rotate(14deg); }
}
@keyframes salute-wave-l {
  0%   { transform: rotate(14deg); }
  100% { transform: rotate(-14deg); }
}

.cheer-heart {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  opacity: 0;
  animation: heart-float 2.4s ease-in-out infinite;
}
.cheer-heart-2 { animation-delay: 0.8s; }
.cheer-heart-3 { animation-delay: 1.6s; }

@keyframes heart-float {
  0%       { transform: translateY(10px) scale(0.4); opacity: 0; }
  35%      { transform: translateY(0) scale(1); opacity: 0.8; }
  100%     { transform: translateY(-16px) scale(0.85); opacity: 0; }
}

/* ══════════════════════════════════════════════
   อนิเมะ 4: หนูหมวกสิงโตเต้นคู่กับมะม่วง
   ══════════════════════════════════════════════ */
.mango-dance {
  animation: dance-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dance-enter {
  0%   { transform: scale(0.7) rotate(-8deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.hop-a,
.hop-b {
  animation: dance-hop 0.4s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}
.hop-b { animation-direction: alternate-reverse; }

@keyframes dance-hop {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

.dance-body,
.dance-mango-body {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: dance-sway 0.8s ease-in-out infinite alternate;
}
.dance-mango-body { animation-direction: alternate-reverse; }

@keyframes dance-sway {
  0%   { transform: rotate(-7deg) scale(1.03, 0.97); }
  100% { transform: rotate(7deg) scale(0.97, 1.03); }
}

.dance-head {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: dance-tilt 0.8s ease-in-out infinite alternate;
}
@keyframes dance-tilt {
  0%   { transform: rotate(9deg); }
  100% { transform: rotate(-9deg); }
}

.dance-arm-l,
.dance-arm-ml {
  transform-box: fill-box;
  transform-origin: 100% 100%;
  animation: dance-arm-l 0.4s ease-in-out infinite alternate;
}
.dance-arm-r,
.dance-arm-mr {
  transform-box: fill-box;
  transform-origin: 0 100%;
  animation: dance-arm-r 0.4s ease-in-out infinite alternate;
}
.dance-arm-ml,
.dance-arm-mr { animation-direction: alternate-reverse; }

@keyframes dance-arm-l {
  0%   { transform: rotate(-32deg); }
  100% { transform: rotate(14deg); }
}
@keyframes dance-arm-r {
  0%   { transform: rotate(32deg); }
  100% { transform: rotate(-14deg); }
}

.dance-shadow {
  animation: dance-shadow-anim 0.4s ease-in-out infinite alternate;
}
@keyframes dance-shadow-anim {
  0%   { rx: 30; opacity: 0.12; }
  100% { rx: 20; opacity: 0.05; }
}

.dance-shadow-b {
  animation: dance-shadow-b-anim 0.4s ease-in-out infinite alternate-reverse;
}
@keyframes dance-shadow-b-anim {
  0%   { rx: 18; opacity: 0.12; }
  100% { rx: 12; opacity: 0.05; }
}

.duo-heart {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  opacity: 0;
  animation: duo-heart-float 2.6s ease-in-out infinite;
}
@keyframes duo-heart-float {
  0%   { transform: translateY(16px) scale(0.4); opacity: 0; }
  35%  { transform: translateY(2px) scale(1); opacity: 0.75; }
  100% { transform: translateY(-14px) scale(0.85); opacity: 0; }
}

.note {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  opacity: 0;
  animation: note-float 2.2s ease-in-out infinite;
}
.note-2 { animation-delay: 1.1s; }

@keyframes note-float {
  0%   { transform: translate(0, 14px) scale(0.4) rotate(-14deg); opacity: 0; }
  30%  { transform: translate(-3px, 0) scale(1) rotate(8deg); opacity: 0.8; }
  100% { transform: translate(-10px, -24px) scale(0.9) rotate(-10deg); opacity: 0; }
}

/* ── Text ── */
.loading-text {
  margin: 6px 0 2px;
  font-size: 16px;
  font-weight: 700;
  color: #0E3E7A;
  letter-spacing: 0.4px;
  animation: text-wiggle 2.4s ease-in-out infinite;
}
@keyframes text-wiggle {
  0%, 100% { transform: rotate(-0.8deg); }
  50%      { transform: rotate(0.8deg); }
}

.loading-sub {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #C2762B;
}

/* ── Dots ── */
.dots {
  display: flex;
  gap: 8px;
}
.dots span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  animation: dot-pop 0.66s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.dots span:nth-child(1) { background: #F59E23; animation-delay: 0s; }
.dots span:nth-child(2) { background: #EC6A61; animation-delay: 0.13s; }
.dots span:nth-child(3) { background: #5FAE6E; animation-delay: 0.26s; }

@keyframes dot-pop {
  0%, 100% { transform: translateY(0) scale(1, 0.86);   opacity: 0.75; }
  50%      { transform: translateY(-9px) scale(0.9, 1.12); opacity: 1; }
}

/* ── Fade ── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .loading-card,
  .mango-wrap,
  .squish,
  .shadow-anim,
  .arm-l, .arm-r, .leg-l, .leg-r,
  .ground-dashes,
  .mango-writing,
  .pencil-arm,
  .think-spark,
  .mango-salute,
  .salute-bob,
  .salute-hand,
  .cheer-heart,
  .mango-dance,
  .hop-a, .hop-b,
  .dance-body,
  .dance-mango-body,
  .dance-head,
  .dance-arm-l, .dance-arm-r,
  .dance-arm-ml, .dance-arm-mr,
  .dance-shadow,
  .dance-shadow-b,
  .duo-heart,
  .note,
  .eyes,
  .sparkles i,
  .loading-text {
    animation: none;
  }
  .cheer-heart { opacity: 0.8; }
  .duo-heart   { opacity: 0.75; }
  .note        { opacity: 0.8; }
  .sparkles i  { opacity: 0.6; }
}
</style>
