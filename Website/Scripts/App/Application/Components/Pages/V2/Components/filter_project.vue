<template>
  <div class="project-filter" v-click-outside="closeDropdown">
    <!-- Pill trigger -->
    <div
      class="filter-pill"
      :class="{ active: isOpen }"
      @click="toggleDropdown"
    >
      <i class="fas fa-filter"></i>
      <span class="pill-label" v-if="pillLabel">{{ pillLabel }}</span>
      <span class="pill-arrow">{{ isOpen ? '▴' : '▾' }}</span>
    </div>

    <!-- Dropdown panel -->
    <transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-panel" @click.stop>

        <!-- Section: โครงการหลัก -->
        <div class="dd-section">
          <div class="dd-title">{{ ui.csm_v2_main_project }}</div>

          <div
            class="dd-item"
            :class="{ selected: selectedMain === null }"
            @click="selectMainAll"
          >
            <span class="check-box">{{ selectedMain === null ? '✓' : '' }}</span>
            {{ ui.csm_v2_all_projects }}
          </div>

          <div
            v-for="project in projects"
            :key="project.id"
            class="dd-item"
            :class="{ selected: selectedMain === project.id }"
            @click="selectMain(project)"
          >
            <span class="check-box">{{ selectedMain === project.id ? '✓' : '' }}</span>
            {{ project.name }}
          </div>
        </div>

        <!-- Section: โครงการย่อย (แสดงเมื่อเลือกโครงการหลักที่มี phase) -->
        <transition name="phase-slide">
          <div v-if="selectedMain !== null && currentPhases.length > 0">
            <div class="dd-divider"></div>
            <div class="dd-section dd-section--phase">
              <div class="dd-title dd-title--phase">{{ ui.csm_v2_sub_project_multi }}</div>

              <div
                class="dd-item"
                :class="{ selected: isAllPhasesSelected }"
                @click="selectAllPhases"
              >
                <span class="check-box">{{ isAllPhasesSelected ? '✓' : '' }}</span>
                Select All
              </div>

              <div
                v-for="phase in currentPhases"
                :key="phase.id"
                class="dd-item dd-item--phase"
                :class="{ selected: selectedPhases.includes(phase.id) }"
                @click="togglePhase(phase.id)"
              >
                <span class="check-box">{{ selectedPhases.includes(phase.id) ? '✓' : '' }}</span>
                {{ phase.name }}
              </div>
            </div>
          </div>
        </transition>

        <!-- Hint: ยังไม่ได้เลือกโครงการหลัก -->
        <div v-if="selectedMain === null" class="dd-hint">
          {{ ui.csm_v2_select_main_project_first }}
        </div>

      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ProjectFilterDropdown',

  directives: {
    clickOutside: {
      bind(el, binding) {
        el._clickOutsideHandler = (event) => {
          if (!el.contains(event.target)) {
            binding.value()
          }
        }
        document.addEventListener('click', el._clickOutsideHandler)
      },
      unbind(el) {
        document.removeEventListener('click', el._clickOutsideHandler)
      }
    }
  },

  props: {
    // รายการโครงการหลัก พร้อม phases ย่อย
    // รูปแบบ: [{ id: 1, name: 'Mango Ville', phases: [{ id: 11, name: 'Phase 1' }, ...] }]
    projects: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      ui: window.ui,
      isOpen: false,
      selectedMain: null,   // null = ทุกโครงการ, หรือ project.id
      selectedPhases: []    // array ของ phase.id ที่เลือก ([] = Select All)
    }
  },

  computed: {
    // หา phases ของโครงการหลักที่เลือกอยู่
    currentPhases() {
      if (this.selectedMain === null) return []
      const project = this.projects.find(p => p.id === this.selectedMain)
      return project ? project.phases : []
    },

    // เช็คว่า Select All phases หรือเปล่า (selectedPhases ว่าง = เลือกทั้งหมด)
    isAllPhasesSelected() {
      return this.selectedPhases.length === 0
    },

    // label ที่แสดงบน pill
    pillLabel() {
      if (this.selectedMain === null) return this.ui.csm_v2_all_projects

      const project = this.projects.find(p => p.id === this.selectedMain)
      if (!project) return this.ui.csm_v2_all_projects

      return project.name
    },

    // ค่าที่ emit ออกไปให้ parent ใช้ filter
    filterValue() {
      return {
        projectId: this.selectedMain,
        phaseIds: this.selectedPhases.length > 0
          ? this.selectedPhases
          : this.currentPhases.map(p => p.id),
        isAllSelected: this.isAllPhasesSelected
      }
    }
  },

  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },

    closeDropdown() {
      this.isOpen = false
    },

    // เลือก "ทุกโครงการ"
    selectMainAll() {
      this.selectedMain = null
      this.selectedPhases = []
      this.$emit('change', { projectId: null, phaseIds: [], isAllSelected: true })
    },

    // เลือกโครงการหลัก
    selectMain(project) {
      this.selectedMain = project.id
      this.selectedPhases = []  // reset เป็น Select All

      this.$emit('change', this.filterValue)
    },

    // เลือก Select All phases
    selectAllPhases() {
      this.selectedPhases = []
      this.$emit('change', this.filterValue)
    },

    // toggle phase ย่อย
    togglePhase(phaseId) {
      const idx = this.selectedPhases.indexOf(phaseId)
      if (idx > -1) {
        this.selectedPhases.splice(idx, 1)
      } else {
        this.selectedPhases.push(phaseId)
      }

      // ถ้าไม่มีเลือกเลย ให้ถือว่า Select All
      if (this.selectedPhases.length === 0) {
        this.selectAllPhases()
        return
      }

      this.$emit('change', this.filterValue)
    }
  }
}
</script>

<style scoped>
.project-filter {
  position: relative;
  display: inline-block;
}

/* Pill */
.filter-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 15px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  user-select: none;
  transition: background 0.15s;
  height: min-content;
}

.filter-pill.active,
.filter-pill:hover {
  background: white;
  color: #00b894;
}

.pill-label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-arrow {
  font-size: 9px;
  opacity: 0.7;
}

/* Dropdown panel */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 240px;
  z-index: 999;
  /* max-height: 450px; */
  max-height: 55vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom Scrollbar for Dropdown Panel */
.dropdown-panel::-webkit-scrollbar {
  width: 6px;
}

.dropdown-panel::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.dropdown-panel::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.dropdown-panel::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.dd-section {
  padding: 10px 14px;
}

.dd-section--phase {
  background: #f9fffe;
}

.dd-title {
  font-size: 10px;
  color: #aaa;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dd-title--phase {
  color: #00b894;
}

.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  transition: background 0.1s;
}

.dd-item:hover {
  background: #f5f5f5;
}

.dd-item.selected {
  background: #e8f8f3;
  color: #00b894;
}

.dd-item--phase {
  padding-left: 22px;
  color: #555;
}

.check-box {
  width: 14px;
  height: 14px;
  border: 1.5px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
  color: white;
  background: transparent;
  transition: all 0.1s;
}

.dd-item.selected .check-box {
  background: #00b894;
  border-color: #00b894;
}

.dd-divider {
  height: 0.5px;
  background: #f0f0f0;
}

.dd-hint {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  padding: 8px 14px 12px;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-fade-enter,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.phase-slide-enter-active,
.phase-slide-leave-active {
  transition: opacity 0.2s, max-height 0.2s;
  max-height: 1000px;
  overflow: hidden;
}
.phase-slide-enter,
.phase-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>