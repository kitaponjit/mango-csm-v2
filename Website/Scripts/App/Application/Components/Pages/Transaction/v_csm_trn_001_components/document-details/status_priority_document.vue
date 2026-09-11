<template>
    <div class="status-priority-wrapper">
        <!-- Status Card -->
        <div class="col-lg-6 col-md-12 col-sm-12" style="padding: 0 8px 0 0;">
            <div class="modern-card status-card">
                <div class="card-label">
                    <span class="label-icon">&#9776;</span>
                    {{ ui.csm_home_job_status }}
                </div>
                <div class="stepper-container">
                    <div class="stepper">
                        <!-- Wait -->
                        <div class="step" :class="{ active: ['W','I','Y'].includes(formData.job_status), inactive: !['W','I','Y'].includes(formData.job_status) }">
                            <div class="step-circle">
                                <svg v-if="['W','I','Y'].includes(formData.job_status)" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8l3.5 3.5L13 4.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span v-else class="step-dot"></span>
                            </div>
                            <div class="step-line" :class="{ filled: ['I','Y'].includes(formData.job_status) }"></div>
                            <div class="step-label" :class="{ 'label-active': ['W','I','Y'].includes(formData.job_status) }" style="left: 16px !important;">{{ ui.csm_v2_status_pending }}</div>
                        </div>
                        <!-- In Progress -->
                        <div class="step" :class="{ active: ['I','Y'].includes(formData.job_status), inactive: !['I','Y'].includes(formData.job_status) }">
                            <div class="step-circle">
                                <svg v-if="['I','Y'].includes(formData.job_status)" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8l3.5 3.5L13 4.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span v-else class="step-dot"></span>
                            </div>
                            <div class="step-line" :class="{ filled: formData.job_status === 'Y' }"></div>
                            <div class="step-label" :class="{ 'label-active': ['I','Y'].includes(formData.job_status) }" style="left: 14px !important;">{{ ui.csm_v2_status_in_progress }}</div>
                        </div>
                        <!-- Complete -->
                        <div class="step last-step" :class="{ active: formData.job_status === 'Y', inactive: formData.job_status !== 'Y' }">
                            <div class="step-circle">
                                <svg v-if="formData.job_status === 'Y'" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8l3.5 3.5L13 4.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span v-else class="step-dot"></span>
                            </div>
                            <div class="step-label" :class="{ 'label-active': formData.job_status === 'Y' }">{{ ui.csm_v2_status_finished }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Priority Card -->
        <div class="col-lg-6 col-md-12 col-sm-12 hidden-md hidden-sm" style="padding: 0 0 0 8px;">
            <div class="modern-card priority-card">
                <div class="card-label">
                    <span class="label-icon">&#9733;</span>
                    {{ ui.csm_home_job_priority }}
                </div>
                <div class="priority-body">
                    <div class="priority-badge" :style="{ borderColor: currentStatusClass(), boxShadow: '0 4px 20px ' + currentStatusClass() + '40' }">
                        <div class="priority-indicator" :style="{ background: currentStatusClass() }"></div>
                        <span class="priority-text" :style="{ color: currentStatusClass() }" v-text="currentStatusText()"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">
    export default {
       props :{
        priorityCodeData_isActive:Array,
        formData: Object
       },
       data() {
        return {
         ui: window.ui,
        }
       },
       methods: {
        currentStatusText() {
            return $linq(this.priorityCodeData_isActive).where(w => w.prioity_code == this.formData.job_priority).select(x => x.prioity_des).firstOrDefault()
        },
        currentStatusClass() {
             var color = $linq(this.priorityCodeData_isActive).where(w => w.prioity_code == this.formData.job_priority).select(x => x.priority_color).firstOrDefault() || ''
            return color || '#000000';
        },
       },
    }
</script>

<style scoped>
.status-priority-wrapper {
    display: flex;
    flex-wrap: wrap;
    margin: 15px;
    padding: 4px 0 8px;
    align-items: stretch;
}

.status-priority-wrapper > [class*="col-"] {
    display: flex;
    flex-direction: column;
}

.modern-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
    padding: 20px 24px;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s ease;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.modern-card:hover {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.label-icon {
    font-size: 11px;
    color: #f59e0b;
}

/* ── Stepper ── */
.stepper-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
}

.stepper {
    display: flex;
    align-items: flex-start;
    width: 100%;
    max-width: 380px;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
}

.step:not(.last-step) {
    flex-direction: row;
    flex: 1;
    align-items: flex-start;
}

.step:not(.last-step) .step-label {
    position: absolute;
    top: 30px;
    left: 0;
    transform: translateX(-50%);
    white-space: nowrap;
}

.last-step {
    flex: 0;
}

.last-step .step-label {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
}

.step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
    z-index: 1;
}

.step.active .step-circle {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
}

.step.inactive .step-circle {
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
}

.step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d1d5db;
    display: block;
}

.step-line {
    flex: 1;
    height: 3px;
    background: #e5e7eb;
    margin-top: 14px;
    border-radius: 2px;
    transition: background 0.4s ease;
}

.step-line.filled {
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.step-label {
    font-size: 11px;
    font-weight: 500;
    color: #9ca3af;
    margin-top: 8px;
    transition: color 0.3s ease;
}

.step-label.label-active {
    color: #374151;
    font-weight: 600;
}

/* ── Priority ── */
.priority-body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
}

.priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 24px;
    border-radius: 50px;
    border: 2px solid;
    background: #fafafa;
    transition: all 0.3s ease;
}

.priority-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
}

.priority-text {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.3px;
}
.content-body{overflow-y: hidden !important;}
</style>
