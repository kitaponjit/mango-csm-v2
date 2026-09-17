<template>
  <div class="v-csm-remain">
    <re-page ref="page">
      <template #body>
        <section class="content rc-wrap">
          <!-- Filter / search bar -->
          <div class="rc-bar">
            <div class="rc-bar__head">
              <div class="rc-bar__title">
                <i class="fas fa-filter"></i>
                <span>{{ ui.csm_remain_filter_title }}</span>
              </div>
              <div class="rc-bar__actions">
                <label class="rc-switch" :class="{ on: filter.showReject }" :title="ui.csm_remain_tt_show_reject">
                  <input type="checkbox" v-model="filter.showReject" />
                  <span class="rc-switch__track"><span class="rc-switch__knob"></span></span>
                  <span class="rc-switch__text">{{ ui.csm_remain_show_reject }}</span>
                </label>
                <button class="rc-bar__btn rc-bar__btn--ghost" @click="resetFilter()" :title="ui.csm_remain_tt_clear_filter"><i class="fas fa-eraser"></i> {{ ui.csm_trn_clear_data }}</button>
                <button class="rc-bar__btn rc-bar__btn--print" @click="printSummary()" :title="ui.csm_remain_tt_print_summary"><i class="fas fa-print"></i> {{ ui.erp_print }}</button>
                <button class="rc-bar__btn rc-bar__btn--ai" @click="analyzeWithAi()" :disabled="aiLoading" :title="ui.csm_remain_tt_ai_risk"><i class="fas fa-robot"></i> {{ aiLoading ? 'กำลังวิเคราะห์...' : 'AI วิเคราะห์' }}</button>
                <button class="rc-bar__btn rc-bar__btn--chat" @click="openChat()" :title="ui.csm_remain_tt_chat_ai"><i class="fas fa-comments"></i> {{ ui.csm_remain_chat_ai }}</button>
                <button class="rc-bar__btn" @click="loadChart()" :title="ui.erp_refresh"><i class="fas fa-sync-alt"></i> {{ ui.erp_refresh }}</button>
                <button class="rc-bar__btn rc-bar__btn--toggle" @click="filterOpen = !filterOpen" :title="filterOpen ? 'หุบ Filter' : 'ขยาย Filter'">
                  <i class="fas fa-chevron-down rc-bar__chevron" :class="{ open: filterOpen }"></i>
                </button>
              </div>
            </div>
            <div class="rc-bar__summary" v-if="!filterOpen && activeFilterChips.length">
              <span class="rc-fchip" v-for="(chip, i) in activeFilterChips" :key="i">
                <i :class="chip.icon"></i> {{ chip.label }}: <b>{{ chip.value }}</b>
                <i class="fas fa-times rc-fchip__rm" @click.stop="chip.clear()"></i>
              </span>
            </div>
            <transition name="rc-filter">
            <div class="rc-cond-groups" v-show="filterOpen">
              <!-- กลุ่ม 1: ลูกค้า -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-building"></i> {{ ui.csm_v2_customer }}</div>
                <div class="rc-cond rc-cond--2">
                  <div class="rc-cond__item rc-cond__item--search">
                    <label>{{ ui.search }}</label>
                    <div class="rc-search">
                      <i class="fas fa-search"></i>
                      <input type="text" v-model="filter.text" :placeholder="ui.csm_remain_ph_customer" />
                      <i v-if="filter.text" class="fas fa-times rc-search__clear" @click="filter.text = ''"></i>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_doc_year }}</label>
                    <select class="rc-select" v-model="filter.year">
                      <option value="">{{ ui.csm_remain_all_years }}</option>
                      <option v-for="(y, i) in years" :key="i" :value="y">{{ y }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- กลุ่ม 2: งาน / Service -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-cogs"></i> {{ ui.csm_remain_work_service }}</div>
                <div class="rc-cond rc-cond--6">
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_service_group }}</label>
                    <div class="rc-msdrop" :class="{ open: groupDropOpen }" v-click-outside="() => groupDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="groupDropOpen = !groupDropOpen">
                        <span v-if="!filter.groups.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(g, i) in filter.groups" :key="i">{{ groupName(g) }}<i class="fas fa-times" @click.stop="removeGroup(i)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="groupDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="groupSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(g, i) in filteredGroups" :key="i">
                          <input type="checkbox" :value="g.serv_group_code" v-model="filter.groups" />
                          <span>{{ g.serv_group_name }}</span>
                        </label>
                        <div v-if="!filteredGroups.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.erp_service }}</label>
                    <div class="rc-msdrop" :class="{ open: serviceDropOpen }" v-click-outside="() => serviceDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="serviceDropOpen = !serviceDropOpen">
                        <span v-if="!filter.services.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(s, i) in filter.services" :key="i">{{ serviceName(s) }}<i class="fas fa-times" @click.stop="filter.services.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="serviceDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="serviceSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <div v-for="(grp, gi) in filteredServicesGrouped" :key="'g'+gi">
                          <div class="rc-msdrop__group">{{ grp.serv_group_name }}</div>
                          <label class="rc-msdrop__item" v-for="(s, i) in grp.services" :key="i">
                            <input type="checkbox" :value="s.serv_code" v-model="filter.services" />
                            <span>{{ s.serv_name }}</span>
                          </label>
                        </div>
                        <div v-if="!filteredServicesGrouped.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.erp_status }}</label>
                    <div class="rc-msdrop" :class="{ open: statusDropOpen }" v-click-outside="() => statusDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="statusDropOpen = !statusDropOpen">
                        <span v-if="!filter.statuses.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all_status }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(s, i) in filter.statuses" :key="i">{{ s }}<i class="fas fa-times" @click.stop="filter.statuses.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="statusDropOpen">
                        <label class="rc-msdrop__item" v-for="(name, i) in allStatusNames" :key="i">
                          <input type="checkbox" :value="name" v-model="filter.statuses" />
                          <span>{{ name }}</span>
                        </label>
                        <div v-if="!allStatusNames.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.erp_priority }}</label>
                    <div class="rc-msdrop" :class="{ open: priorityDropOpen }" v-click-outside="() => priorityDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="priorityDropOpen = !priorityDropOpen">
                        <span v-if="!filter.priorities.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(p, i) in filter.priorities" :key="i">{{ priorityLabel(p) }}<i class="fas fa-times" @click.stop="filter.priorities.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="priorityDropOpen">
                        <label class="rc-msdrop__item" v-for="(p, i) in priorities" :key="i">
                          <input type="checkbox" :value="p.priority_code" v-model="filter.priorities" />
                          <span>{{ p.priority_name || p.priority_code }}</span>
                        </label>
                        <div v-if="!priorities.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item" v-if="is_mango">
                    <label>{{ ui.erp_module }}</label>
                    <div class="rc-msdrop" :class="{ open: moduleDropOpen }" v-click-outside="() => moduleDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="moduleDropOpen = !moduleDropOpen">
                        <span v-if="!filter.modules.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(m, i) in filter.modules" :key="i">{{ m }}<i class="fas fa-times" @click.stop="filter.modules.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="moduleDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="moduleSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(m, i) in filteredModules" :key="i">
                          <input type="checkbox" :value="m" v-model="filter.modules" />
                          <span>{{ m }}</span>
                        </label>
                        <div v-if="!filteredModules.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_case_overdue }}</label>
                    <div class="rc-cond__inline">
                      <select class="rc-select" v-model="filter.over_due">
                        <option value="">{{ ui.csm_remain_all }}</option>
                        <option value="O">{{ ui.csm_case_overdue }}</option>
                        <option value="N">{{ ui.csm_remain_not_overdue }}</option>
                      </select>
                      <input
                        v-if="filter.over_due === 'O'"
                        type="number"
                        min="0"
                        class="rc-select rc-cond__days"
                        v-model="filter.over_due_days"
                        :placeholder="ui.csm_remain_ph_days"
                        :title="ui.csm_remain_tt_overdue_days"
                      />
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_status_approve }}</label>
                    <select class="rc-select" v-model="filter.statusAppr">
                      <option value="">{{ ui.csm_remain_all }}</option>
                      <option v-for="(s, i) in statusApprList" :key="i" :value="s">{{ statusApprLabel(s) }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- กลุ่ม 3: ผู้รับผิดชอบ -->
              <div class="rc-cond-group">
                <div class="rc-cond-group__label"><i class="fas fa-user-tie"></i> {{ ui.erp_responsible }}</div>
                <div class="rc-cond rc-cond--6">
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_team_worker }}</label>
                    <div class="rc-msdrop" :class="{ open: teamWorkerDropOpen }" v-click-outside="() => teamWorkerDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="teamWorkerDropOpen = !teamWorkerDropOpen">
                        <span v-if="!filter.teamWorkers.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.teamWorkers" :key="i">{{ teamWorkerName(t) }}<i class="fas fa-times" @click.stop="filter.teamWorkers.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="teamWorkerDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="teamWorkerSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTeamWorkers" :key="i">
                          <input type="checkbox" :value="t.team_code" v-model="filter.teamWorkers" />
                          <span>{{ t.team_name }}</span>
                        </label>
                        <div v-if="!filteredTeamWorkers.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item" :class="{ 'rc-cond__item--disabled': filter.teamWorkers.length }">
                    <label>{{ ui.csm_trn_worker }}</label>
                    <div class="rc-msdrop" :class="{ open: workerDropOpen, disabled: filter.teamWorkers.length }" v-click-outside="() => workerDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="!filter.teamWorkers.length && (workerDropOpen = !workerDropOpen)">
                        <span v-if="filter.teamWorkers.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_use_teams_worker }}</span>
                        <span v-else-if="!filter.workers.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(w, i) in filter.workers" :key="i">{{ w }}<i class="fas fa-times" @click.stop="filter.workers.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="workerDropOpen && !filter.teamWorkers.length">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="workerSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(w, i) in filteredWorkers" :key="i">
                          <input type="checkbox" :value="w" v-model="filter.workers" />
                          <span>{{ w }}</span>
                        </label>
                        <div v-if="!filteredWorkers.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_team_requester }}</label>
                    <div class="rc-msdrop" :class="{ open: teamRequesterDropOpen }" v-click-outside="() => teamRequesterDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="teamRequesterDropOpen = !teamRequesterDropOpen">
                        <span v-if="!filter.teamRequesters.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.teamRequesters" :key="i">{{ teamRequesterName(t) }}<i class="fas fa-times" @click.stop="filter.teamRequesters.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="teamRequesterDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="teamRequesterSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTeamRequesters" :key="i">
                          <input type="checkbox" :value="t.team_code" v-model="filter.teamRequesters" />
                          <span>{{ t.team_name }}</span>
                        </label>
                        <div v-if="!filteredTeamRequesters.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item" :class="{ 'rc-cond__item--disabled': filter.teamRequesters.length }">
                    <label>{{ ui.erp_requester }}</label>
                    <div class="rc-msdrop" :class="{ open: requesterDropOpen, disabled: filter.teamRequesters.length }" v-click-outside="() => requesterDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="!filter.teamRequesters.length && (requesterDropOpen = !requesterDropOpen)">
                        <span v-if="filter.teamRequesters.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_use_teams_requester }}</span>
                        <span v-else-if="!filter.requesters.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(r, i) in filter.requesters" :key="i">{{ r }}<i class="fas fa-times" @click.stop="filter.requesters.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="requesterDropOpen && !filter.teamRequesters.length">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="requesterSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(r, i) in filteredRequesters" :key="i">
                          <input type="checkbox" :value="r" v-model="filter.requesters" />
                          <span>{{ r }}</span>
                        </label>
                        <div v-if="!filteredRequesters.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ is_mango ? 'Tester' : 'Quality Assurance' }}</label>
                    <div class="rc-msdrop" :class="{ open: testerQcDropOpen }" v-click-outside="() => testerQcDropOpen = false">
                      <div class="rc-msdrop__trigger" @click="testerQcDropOpen = !testerQcDropOpen">
                        <span v-if="!filter.testerQcs.length" class="rc-msdrop__placeholder">{{ ui.csm_remain_all }}</span>
                        <span v-else class="rc-msdrop__tags">
                          <span class="rc-msdrop__tag" v-for="(t, i) in filter.testerQcs" :key="i">{{ t }}<i class="fas fa-times" @click.stop="filter.testerQcs.splice(i, 1)"></i></span>
                        </span>
                        <i class="fas fa-chevron-down rc-msdrop__arrow"></i>
                      </div>
                      <div class="rc-msdrop__menu" v-show="testerQcDropOpen">
                        <div class="rc-msdrop__search"><i class="fas fa-search"></i><input type="text" v-model="testerQcSearch" :placeholder="ui.csm_remain_ph_search" @click.stop /></div>
                        <label class="rc-msdrop__item" v-for="(t, i) in filteredTesterQcs" :key="i">
                          <input type="checkbox" :value="t" v-model="filter.testerQcs" />
                          <span>{{ t }}</span>
                        </label>
                        <div v-if="!filteredTesterQcs.length" class="rc-msdrop__empty">{{ ui.erp_data_not_found }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="rc-cond__item">
                    <label>{{ ui.csm_remain_sort }}</label>
                    <select class="rc-select" v-model="filter.sort">
                      <option value="qty_desc">{{ ui.csm_remain_sort_qty_desc }}</option>
                      <option value="qty_asc">{{ ui.csm_remain_sort_qty_asc }}</option>
                      <option value="name_asc">{{ ui.csm_remain_sort_name_asc }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            </transition>
          </div>

          <!-- Stat strip -->
          <div class="rc-stats">
            <div class="rc-stat rc-stat--accent">
              <div class="rc-stat__icon"><i class="fas fa-users"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_customers_with_work }}</span>
                <span class="rc-stat__value">{{summary.customer_count || 0}}<small>{{ ui.csm_remain_unit_customer }}</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--danger">
              <div class="rc-stat__icon"><i class="fas fa-tasks"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_total_work }}</span>
                <span class="rc-stat__value">{{summary.task_total || 0}}<small>{{ ui.csm_remain_unit_item }}</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--soft">
              <div class="rc-stat__icon"><i class="fas fa-chart-bar"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_avg_per_customer }}</span>
                <span class="rc-stat__value">{{avgPerCustomer}}<small>{{ ui.csm_remain_unit_per_customer }}</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--purple">
              <div class="rc-stat__icon"><i class="fas fa-project-diagram"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_projects_with_work }}</span>
                <span class="rc-stat__value">{{summary.project_count || 0}}<small>{{ ui.csm_v2_project }}</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--cyan">
              <div class="rc-stat__icon"><i class="fas fa-chart-line"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_avg_per_project }}</span>
                <span class="rc-stat__value">{{avgPerProject}}<small>{{ ui.csm_remain_unit_per_project }}</small></span>
              </div>
            </div>
            <div class="rc-stat rc-stat--warn">
              <div class="rc-stat__icon"><i class="fas fa-exclamation-circle"></i></div>
              <div class="rc-stat__body">
                <span class="rc-stat__label">{{ ui.csm_remain_overdue_work }}</span>
                <span class="rc-stat__value">{{overdueCount}}<small>{{ ui.csm_remain_unit_item }} </small></span>
                           <!-- <span class="rc-stat__value">{{overdueCount}}<small>รายการ ({{overduePercent}}%)</small></span> -->
              </div>
            </div>
          </div>

          <!-- AI Analysis Panel -->
          <div class="rc-ai-panel" v-if="aiResult || aiLoading">
            <div class="rc-ai-panel__head">
              <div class="rc-ai-panel__title"><i class="fas fa-robot"></i> {{ ui.csm_remain_ai_analysis }}</div>
              <button class="rc-ai-panel__close" @click="aiResult = null" v-if="!aiLoading"><i class="fas fa-times"></i></button>
            </div>
            <div class="rc-ai-panel__loading" v-if="aiLoading">
              <span class="rc-ai-spinner"></span> {{ ui.csm_remain_analyzing }}
            </div>
            <div class="rc-ai-panel__body" v-if="aiResult && !aiLoading">
              <!-- Summary + Risks -->
              <div class="rc-ai-grid">
                <div class="rc-ai-section">
                  <div class="rc-ai-section__title"><i class="fas fa-search"></i> {{ ui.csm_remain_root_cause }}</div>
                  <p class="rc-ai-text">{{ aiResult.root_cause_summary }}</p>
                  <div class="rc-ai-section__title" style="margin-top:10px;"><i class="fas fa-exclamation-triangle"></i> {{ ui.csm_remain_key_risks }}</div>
                  <ul class="rc-ai-list">
                    <li v-for="(r, i) in aiResult.top_risks" :key="i">{{ r }}</li>
                  </ul>
                  <div class="rc-ai-section__title" style="margin-top:10px;"><i class="fas fa-lightbulb"></i> {{ ui.erp_option_3 }}</div>
                  <ul class="rc-ai-list rc-ai-list--green">
                    <li v-for="(r, i) in aiResult.recommendations" :key="i">{{ r }}</li>
                  </ul>
                </div>
                <div class="rc-ai-section">
                  <div class="rc-ai-section__title"><i class="fas fa-shield-alt"></i> {{ ui.csm_remain_risk_score }}</div>
                  <div class="rc-ai-risk-list">
                    <div class="rc-ai-risk-row" v-for="(c, i) in aiResult.risk_scores" :key="i">
                      <div class="rc-ai-risk-info">
                        <span class="rc-ai-risk-badge" :class="'rc-ai-risk-badge--' + c.risk_level.toLowerCase()">{{ c.risk_level }}</span>
                        <span class="rc-ai-risk-name" :title="c.customer_name">{{ c.customer_name }}</span>
                      </div>
                      <div class="rc-ai-risk-bar-wrap">
                        <div class="rc-ai-risk-bar" :class="'rc-ai-risk-bar--' + c.risk_level.toLowerCase()" :style="{ width: c.score + '%' }"></div>
                      </div>
                      <span class="rc-ai-risk-score">{{ c.score }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 1: charts (2 columns) -->
          <div class="rc-grid2">
            <div class="rc-panel">
              <div class="rc-panel__head">
                <h2 class="rc-panel__title"><i class="fas fa-chart-bar"></i> {{ ui.csm_remain_overview_by_customer }}</h2>
                <span class="rc-hint"><i class="fas fa-hand-pointer"></i> {{ ui.csm_remain_click_detail }}</span>
              </div>
              <div class="rc-chart">
                <v-chart ref="chart1" id="chart_remain" autoresize style="width:100%!important;height:360px;" :option="barChartOption" />
              </div>
            </div>
            <div class="rc-panel">
              <div class="rc-panel__head">
                <h2 class="rc-panel__title"><i class="fas fa-chart-pie"></i> {{ ui.csm_remain_by_status }}</h2>
                <span class="rc-hint"><i class="fas fa-hand-pointer"></i> {{ ui.csm_remain_click_detail }}</span>
              </div>
              <div class="rc-chart">
                <v-chart ref="chart2" autoresize style="width:100%!important;height:360px;" :option="donutOption" />
              </div>
            </div>
          </div>

          <!-- Row 2: Top customers (full width) -->
          <div class="rc-panel">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title"><i class="fas fa-trophy"></i> {{ ui.csm_remain_top10 }}</h2>
            </div>
            <div class="rc-top">
              <div class="rc-top__row" v-for="(c, i) in topCustomers" :key="c.customer_code || i" @click="clickByCustomer(c)">
                <span class="rc-top__rank" :class="'rc-top__rank--' + (i + 1)">{{ i + 1 }}</span>
                <div class="rc-top__info">
                  <div class="rc-top__name" :title="c.customer_name">{{ c.customer_name || '-' }}</div>
                  <div class="rc-top__track">
                    <span class="rc-top__fill" :style="{ width: topMax ? ((c.doc_count || 0) / topMax * 100) + '%' : '0%' }"></span>
                  </div>
                </div>
                <span class="rc-top__qty">{{ c.doc_count || 0 }}</span>
              </div>
              <div v-if="!topCustomers.length" class="rc-empty rc-empty--sm">
                <span>{{ ui.erp_no_data }}</span>
              </div>
            </div>
          </div>

          <!-- Row 3: Worker Workload -->
          <div class="rc-panel" v-if="workerWorkload.length">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title"><i class="fas fa-user-tie"></i> Worker Workload</h2>
              <span class="rc-hint"><i class="fas fa-hand-pointer"></i> {{ ui.csm_remain_click_detail }}</span>
              <span class="rc-pill">{{ workerWorkload.length }} {{ ui.csm_remain_unit_person }}</span>
            </div>
            <div class="rc-chart">
              <v-chart ref="chartWorker" autoresize style="width:100%!important;height:400px;" :option="workerChartOption" />
            </div>
          </div>

          <!-- Row 3.1: Tester Testload (Mango only) -->
          <div class="rc-panel" v-if="is_mango && testerTestload.length">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title"><i class="fas fa-user-check"></i> Tester (QC) Testload</h2>
              <span class="rc-hint"><i class="fas fa-hand-pointer"></i> {{ ui.csm_remain_click_detail }}</span>
              <span class="rc-pill">{{ testerTestload.length }} {{ ui.csm_remain_unit_person }}</span>
            </div>
            <div class="rc-chart">
              <v-chart ref="chartTester" autoresize style="width:100%!important;height:400px;" :option="testerChartOption" />
            </div>
          </div>

          <!-- Row 4: Customer cards (2 columns) -->
          <div class="rc-panel">
            <div class="rc-panel__head">
              <h2 class="rc-panel__title"><i class="fas fa-th-large"></i> {{ ui.csm_menu_customer_list }}</h2>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="rc-pill">{{ filteredList.length }} {{ ui.csm_remain_unit_customer }}</span>
                <button class="rc-bar__btn rc-bar__btn--ghost" style="height:28px;padding:0 12px;font-size:12px;" @click="clickAllCustomers()"><i class="fas fa-users"></i> All</button>
              </div>
            </div>
            <div class="rc-cards">
              <div class="rc-card" v-for="(c, i) in filteredList" :key="c.customer_code || i" @click="clickByCustomer(c)" tabindex="0" @keyup.enter="clickByCustomer(c)">
                <div class="rc-card__top">
                  <div class="rc-card__avatar">{{ initials(c.customer_name) }}</div>
                  <div class="rc-card__id">
                    <h3 class="rc-card__name" :title="c.customer_name">{{ c.customer_name || '-' }}</h3>
                    <div class="rc-card__code"><i class="fas fa-hashtag"></i>{{ c.customer_code }}</div>
                  </div>
                  <span class="rc-card__total">{{ c.doc_count || 0 }}</span>
                </div>
                <div class="rc-card__bar">
                  <span v-for="(s, si) in c.status" :key="si" class="rc-card__seg"
                        :style="{ flex: c.taskqty[si] || 0, background: statusColorOf(c.status_name[si]) }"
                        :title="c.status_name[si] + ' : ' + c.taskqty[si]"></span>
                </div>
                <div class="rc-card__chips">
                  <span class="rc-chip" v-for="(s, si) in c.status" :key="si">
                    <span class="rc-chip__dot" :style="{ background: statusColorOf(c.status_name[si]) }"></span>
                    {{ c.status_name[si] }} <b>{{ c.taskqty[si] }}</b>
                  </span>
                </div>
              </div>
              <div v-if="!filteredList.length" class="rc-empty">
                <i class="fas fa-inbox"></i>
                <span>{{ ui.csm_remain_no_data_filter }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </re-page>
    <modal-2 ref="modalByCustomer" sheet-class="ct-sheet">
      <template #header>
        <div class="modal-head">
          <div class="modal-head__icon"><i class="fas fa-folder-open"></i></div>
          <div class="modal-head__text">
            <div class="modal-head__title">{{selectedCustomer.customer_name || '-'}}</div>
            <div class="modal-head__sub">
              <i class="fas fa-hashtag"></i> {{selectedCustomer.customer_code}}
              <span class="modal-head__dot">·</span> {{ ui.csm_remain_outstanding_count.replace('{0}', detailList.length) }}
              <span v-if="clickedStatusFilter" class="modal-head__status-badge">{{ clickedStatusFilter }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #body>
        <div class="v-csm-remain rc-modal-body">
          <div class="modal-search-card">
            <div class="rc-toolbar">
              <div class="rc-field">
                <label v-text="ui.search_by || 'Search By'"></label>
                <select class="form-control input-sm" v-model="search.field">
                  <option value="job_no">{{ ui.erp_csm_no }}</option>
                  <option value="task_subject">{{ ui.csm_v2_subject }}</option>
                  <option value="task_service">{{ ui.erp_service }}</option>
                  <option value="request_by">{{ ui.csm_home_req_by }}</option>
                  <option value="contract_user">{{ ui.erp_contact_by }}</option>
                </select>
              </div>
              <div class="rc-field rc-field--grow">
                <label v-text="ui.search || 'Search'"></label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="loadDetail()" :placeholder="ui.csm_remain_ph_search_enter" />
                  <span class="input-group-btn"><button class="rc-btn-search" @click.prevent="loadDetail()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg></button></span>
                </div>
              </div>
              <div class="rc-field rc-count">
                <label>&nbsp;</label>
                <span class="rc-pill">{{detailList.length}} {{ ui.csm_remain_unit_item }}</span>
              </div>
            </div>
          </div>
          <div class="rc-table ag-grid-bordered"><ag-table ref="agr1" :scale="370" :footer="false" @ready="initTableDetail()"></ag-table></div>
        </div>
      </template>
      <template #footer>
        <div class="rc-modal-footer">
          <div class="rc-modal-footer__left">
            <button class="rc-ftr-btn rc-ftr-btn--pdf" @click="$refs.agr1.printPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
            <button class="rc-ftr-btn rc-ftr-btn--excel" @click="$refs.agr1.exportExcel(selectedCustomer.customer_name || 'detail')"><i class="fas fa-file-excel"></i> Excel</button>
          </div>
          <button class="btn btn-sm btn-danger" @click="close()"><i class="fas fa-times"></i> {{ ui.erp_close }}</button>
        </div>
      </template>
    </modal-2>
    <modal-2 ref="modalByStatus" sheet-class="ct-sheet">
      <template #header>
        <div class="modal-head">
          <div class="modal-head__icon" :style="{ background: modalMode === 'worker' ? '#4f6ef7' : (modalMode === 'tester' ? '#22d3ee' : statusColorOf(selectedStatus)) }">
            <i :class="modalMode === 'worker' ? 'fas fa-user-tie' : (modalMode === 'tester' ? 'fas fa-user-check' : 'fas fa-layer-group')"></i>
          </div>
          <div class="modal-head__text">
            <div class="modal-head__title">{{ modalMode === 'worker' ? 'Worker : ' + selectedWorker + (selectedWorkerStatus ? ' (' + selectedWorkerStatus + ')' : '') : (modalMode === 'tester' ? 'Tester : ' + selectedTester + (selectedTesterStatus ? ' (' + selectedTesterStatus + ')' : '') : 'สถานะ : ' + selectedStatus) }}</div>
            <div class="modal-head__sub">
              <i class="fas fa-list-ul"></i> {{ ui.csm_remain_outstanding_count.replace('{0}', statusDetailList.length) }}
            </div>
          </div>
        </div>
      </template>
      <template #body>
        <div class="v-csm-remain rc-modal-body">
          <div class="modal-search-card">
            <div class="rc-toolbar">
              <div class="rc-field rc-field--grow">
                <label>{{ ui.search }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model="statusSearch" :placeholder="ui.csm_remain_ph_search_detail" />
                </div>
              </div>
              <div class="rc-field rc-count">
                <label>&nbsp;</label>
                <span class="rc-pill">{{statusDetailList.length}} {{ ui.csm_remain_unit_item }}</span>
              </div>
            </div>
          </div>
          <div class="rc-table ag-grid-bordered"><ag-table ref="agr2" :scale="370" :footer="false" @ready="initTableStatus()"></ag-table></div>
        </div>
      </template>
      <template #footer>
        <div class="rc-modal-footer">
          <div class="rc-modal-footer__left">
            <button class="rc-ftr-btn rc-ftr-btn--pdf" @click="$refs.agr2.printPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
            <button class="rc-ftr-btn rc-ftr-btn--excel" @click="$refs.agr2.exportExcel(modalMode === 'worker' ? selectedWorker : (modalMode === 'tester' ? selectedTester : (selectedStatus || 'status')))"><i class="fas fa-file-excel"></i> Excel</button>
          </div>
          <button class="btn btn-sm btn-danger" @click="$refs.modalByStatus.closeModal()"><i class="fas fa-times"></i> {{ ui.erp_close }}</button>
        </div>
      </template>
    </modal-2>
    <modal-2 ref="modalChat" :hideFooter="true" sheet-class="ct-sheet">
      <template #header>
        <div class="modal-head">
          <div class="modal-head__icon" style="background:linear-gradient(135deg,#0ea5e9,#22d3ee);"><i class="fas fa-comments"></i></div>
          <div class="modal-head__text">
            <div class="modal-head__title">{{ ui.csm_remain_chat_ai }}</div>
            <div class="modal-head__sub">
              <i class="fas fa-robot"></i> {{ ui.csm_remain_chat_subtitle }}
            </div>
          </div>
        </div>
      </template>
      <template #body>
        <div class="v-csm-remain rc-modal-body">
          <div class="rc-chat">
            <div class="rc-chat__context">
              <i class="fas fa-filter"></i>
              <template v-if="aiDataLoading">{{ ui.csm_remain_loading_ai_data }}</template>
              <template v-else>{{ ui.csm_remain_data_ref }} <b>{{ chatRows.length }}</b> {{ ui.csm_remain_task_excl_reject }} / <b>{{ aiCustomerCount }}</b> {{ ui.csm_v2_customer }}</template>
              <select v-model="chatYearFilter" class="rc-chat__year-select" :title="ui.csm_remain_tt_filter_year">
                <option value="">{{ ui.erp_every_year }}</option>
                <option v-for="y in chatYearOptions" :key="y" :value="y">{{ ui.erp_year }} {{ y }}</option>
              </select>
              <span class="rc-chat__context-spacer"></span>
              <button class="rc-chat__clear" @click="clearChat()" v-if="chatMessages.length" :title="ui.csm_remain_tt_clear_chat"><i class="fas fa-trash-alt"></i> {{ ui.csm_remain_clear_chat }}</button>
            </div>
            <div class="rc-chat__body" ref="chatBody">
              <div class="rc-chat__empty" v-if="!chatMessages.length">
                <i class="fas fa-comment-dots"></i>
                <span>{{ ui.csm_remain_chat_start }}</span>
                <div class="rc-chat__suggests">
                  <button v-for="(q, i) in chatSuggestions" :key="i" class="rc-chat__suggest" @click="sendChat(q)">{{ q }}</button>
                </div>
              </div>
              <div class="rc-chat__msg" :class="'rc-chat__msg--' + m.role" v-for="(m, i) in chatMessages" :key="i">
                <div class="rc-chat__avatar">
                  <i :class="m.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
                </div>
                <div class="rc-chat__content">
                  <div class="rc-chat__bubble" v-html="renderChat(m.content)"></div>
                  <div class="rc-chat__tokens" v-if="m.tokens">
                    <i class="fas fa-microchip"></i>
                    In: {{ m.tokens.input != null ? m.tokens.input.toLocaleString() : '–' }} · Out: {{ m.tokens.output != null ? m.tokens.output.toLocaleString() : '–' }} tokens
                    <span class="rc-chat__tokens-sep">|</span>
                    <i class="fas fa-clock"></i>
                    {{ m.tokens.elapsed != null ? m.tokens.elapsed + 's' : '–' }}
                  </div>
                </div>
              </div>
              <div class="rc-chat__msg rc-chat__msg--assistant" v-if="chatLoading && aiStreamIdx < 0">
                <div class="rc-chat__avatar"><i class="fas fa-robot"></i></div>
                <div class="rc-chat__bubble rc-chat__bubble--typing">
                  <span class="rc-chat__dot"></span><span class="rc-chat__dot"></span><span class="rc-chat__dot"></span>
                </div>
              </div>
            </div>
            <div class="rc-chat__input">
              <textarea
                v-model="chatInput"
                rows="1"
                ref="chatInputBox"
                :placeholder="ui.csm_remain_ph_question"
                @keydown.enter.exact.prevent="sendChat()"
                :disabled="chatLoading"></textarea>
              <button class="rc-chat__send" @click="sendChat()" :disabled="chatLoading || !chatInput.trim()">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal-2>
  </div>
</template>
<script type="text/javascript">
    import { mapState, mapGetters } from '~/stores/helpers'
  import * as echarts from 'echarts';
  import VChart from 'vue-echarts';
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let cpn = {
    data() {
      return {
        auth: window.auth,
        xt: $xt,
        baseUrl,
        ui: window.ui,
        rows: [],
        listData_forAI: [],
        aiDataLoaded: false,
        aiDataLoading: false,
        services: [],
        serviceGroups: [],
        priorities: [],
        years: [],
        workers: [],
        requesters: [],
        teamWorkersList: [],
        teamRequestersList: [],
        testerQcList: [],
        statusApprList: [],
        statusList: [],
        modules: [],
        statusColorMap: {},
        statusCodeMap: {},
        filter: { text: "", year: "", groups: [], services: [], statuses: [], priorities: [], modules: [], over_due: "", over_due_days: "", statusAppr: "", sort: "qty_desc", showReject: false, workers: [], requesters: [], teamWorkers: [], teamRequesters: [], testerQcs: [] },
        filterOpen: false,
        aiLoading: false,
        aiResult: null,
        workerDropOpen: false,
        requesterDropOpen: false,
        teamWorkerDropOpen: false,
        teamRequesterDropOpen: false,
        testerQcDropOpen: false,
        groupDropOpen: false,
        serviceDropOpen: false,
        statusDropOpen: false,
        priorityDropOpen: false,
        moduleDropOpen: false,
        workerSearch: "",
        requesterSearch: "",
        teamWorkerSearch: "",
        teamRequesterSearch: "",
        testerQcSearch: "",
        groupSearch: "",
        serviceSearch: "",
        moduleSearch: "",
        selectedCustomer: {},
        clickedStatusFilter: "",
        detailList: [],
        search: {},
        selectedStatus: "",
        selectedWorker: "",
        selectedWorkerStatus: "",
        selectedTester: "",
        selectedTesterStatus: "",
        modalMode: "status",
        statusSearch: "",
        chatMessages: [],
        chatInput: "",
        chatLoading: false,
        aiStreamIdx: -1,
        chatYearFilter: "",
        chatSuggestions: [
          window.ui.csm_remain_q1,
          window.ui.csm_remain_q2,
          window.ui.csm_remain_q3,
          window.ui.csm_remain_q4
        ],
        listData_forAI:[],
      };
    },
    components: {
      "v-chart": VChart
    },
    directives: {
      clickOutside: {
        beforeMount(el, binding) {
          el._clickOutsideHandler = (e) => { if (!el.contains(e.target)) binding.value(e); };
          document.addEventListener("click", el._clickOutsideHandler);
        },
        unmounted(el) { document.removeEventListener("click", el._clickOutsideHandler); }
      }
    },
    methods: {
      bindWorkerChart() {
        this._workerHoveredSeries = null;
        this.$nextTick(() => {
          let wc = this.$refs.chartWorker && this.$refs.chartWorker.inst;
          if (wc) {
            wc.off("click");
            wc.on("click", (params) => {
              let workerName = (params.value && params.value["worker"]) || params.name;
              this.clickByWorkerStatus(workerName, params.seriesName);
            });
            wc.off("mouseover").on("mouseover", e => {
              if (e.componentType === "series") this._workerHoveredSeries = e.seriesName;
            });
            wc.off("mouseout").on("mouseout", () => {
              this._workerHoveredSeries = null;
            });
          }
        });
      },
      bindTesterChart() {
        this._testerHoveredSeries = null;
        this.$nextTick(() => {
          let tc = this.$refs.chartTester && this.$refs.chartTester.inst;
          if (tc) {
            tc.off("click");
            tc.on("click", (params) => {
              let testerName = (params.value && params.value["tester"]) || params.name;
              this.clickByTesterStatus(testerName, params.seriesName);
            });
            tc.off("mouseover").on("mouseover", e => {
              if (e.componentType === "series") this._testerHoveredSeries = e.seriesName;
            });
            tc.off("mouseout").on("mouseout", () => {
              this._testerHoveredSeries = null;
            });
          }
        });
      },
      async loadChart() {
        let act = `csm/report/DashBoard_RemainByCustomer`;
        let rsp = await $xt.getServer(act);

        let statusList = rsp.statusList || [];
        let colorMap = {};
        let codeMap = {};
        statusList.forEach(s => { colorMap[s.name] = s.color; codeMap[s.name] = s.status; });
        this.statusList = statusList;
        this.statusColorMap = colorMap;
        this.statusCodeMap = codeMap;
        this.services = rsp.services || [];
        this.serviceGroups = rsp.serviceGroups || [];
        this.priorities = rsp.priorities || [];
        this.years = rsp.years || [];
        this.workers = rsp.workers || [];
        this.requesters = rsp.requesters || [];
        this.teamWorkersList = (rsp.team_wo || []).map(t => ({ team_code: t.code_tm, team_name: t.name_tm }));
        this.teamRequestersList = (rsp.team_req || []).map(t => ({ team_code: t.code_tm, team_name: t.name_tm }));
        this.testerQcList = rsp.tester_qc || [];
        this.statusApprList = rsp.status_appr || [];
        this.modules = rsp.module_ || [];
        this.rows = rsp.rows || [];
        this.bindWorkerChart();
        this.bindTesterChart();
      },
      resetFilter() {
        this.filter = { text: "", year: "", groups: [], services: [], statuses: [], priorities: [], modules: [], over_due: "", over_due_days: "", statusAppr: "", sort: "qty_desc", showReject: false, workers: [], requesters: [], teamWorkers: [], teamRequesters: [], testerQcs: [] };
        this.workerSearch = "";
        this.requesterSearch = "";
        this.teamWorkerSearch = "";
        this.teamRequesterSearch = "";
        this.testerQcSearch = "";
        this.groupSearch = "";
        this.serviceSearch = "";
        this.moduleSearch = "";
      },
      onGroupChange() {
        this.filter.services = [];
      },
      removeGroup(i) {
        this.filter.groups.splice(i, 1);
        this.filter.services = [];
      },
      groupName(code) {
        let g = this.serviceGroups.find(x => x.serv_group_code == code);
        return g ? g.serv_group_name : code;
      },
      serviceName(code) {
        let s = this.services.find(x => x.serv_code == code);
        return s ? s.serv_name : code;
      },
      priorityLabel(code) {
        let p = this.priorities.find(x => x.priority_code == code);
        return p ? (p.priority_name || p.priority_code) : code;
      },
      statusApprLabel(code) {
        let map = { "Approve": this.ui.erp_approve, "Reject": this.ui.csm_remain_st_not_approve, "Wait Approve": this.ui.csm_home_wait_approve };
        return map[code] || code;
      },
      teamWorkerName(code) {
        let t = this.teamWorkersList.find(x => x.team_code == code);
        return t ? t.team_name : code;
      },
      teamRequesterName(code) {
        let t = this.teamRequestersList.find(x => x.team_code == code);
        return t ? t.team_name : code;
      },
      clickByStatus(statusName) {
        if (!statusName) return;
        this.modalMode = "status";
        this.selectedStatus = statusName;
        this.statusSearch = "";
        this.$refs.modalByStatus.openModal();
        this.$nextTick(() => this.initTableStatus());
      },
      clickByWorker(workerName) {
        if (!workerName) return;
        this.modalMode = "worker";
        this.selectedWorker = workerName;
        this.selectedWorkerStatus = "";
        this.statusSearch = "";
        this.$refs.modalByStatus.openModal();
        this.$nextTick(() => this.initTableStatus());
      },
      clickByWorkerStatus(workerName, statusName) {
        if (!workerName) return;
        this.modalMode = "worker";
        this.selectedWorker = workerName;
        this.selectedWorkerStatus = statusName || "";
        this.statusSearch = "";
        this.$refs.modalByStatus.openModal();
        this.$nextTick(() => this.initTableStatus());
      },
      clickByTesterStatus(testerName, statusName) {
        if (!testerName) return;
        this.modalMode = "tester";
        this.selectedTester = testerName;
        this.selectedTesterStatus = statusName || "";
        this.statusSearch = "";
        this.$refs.modalByStatus.openModal();
        this.$nextTick(() => this.initTableStatus());
      },
      initTableStatus() {
        let agr = this.$refs.agr2;
        if (!agr) return;
        let fields = [
          
          ["job_no", this.ui.erp_csm_no, "text", { width: 150, align: "left", pinned: 'left', cellRenderer: (params) => this.jobNoCellHtml(params.value) }],
          ["customer_name", this.ui.csm_v2_customer, "text", { width: 240, align: "left" }],
          ["serv_name", "Service", "text", { width: 160, align: "left" }],
          ["task_subject", this.ui.csm_v2_subject, "text", { width: 220, align: "left" }],
          ...(this.is_mango ? [["module_", "Module", "text", { width: 150, align: "left" }]] : []),
          ["request_by", this.ui.csm_home_req_by, "text", { width: 180, align: "left" }],
          ["team_n_r", this.ui.csm_remain_team_requester, "text", { width: 180, align: "left" }],
          ["worker_empname", this.ui.csm_trn_worker, "text", { width: 160, align: "left" }],
          ["team_n_a", this.ui.csm_remain_team_worker, "text", { width: 180, align: "left" }],
          ["tester_empname", this.is_mango ? this.ui.csm_menu_tester : this.ui.csm_remain_qa, "text", { width: 160, align: "left" }],
          ["status_name", "Status", "text", {
            width: 130, align: "center",
            cellRenderer: (params) => this.statusBadgeHtml(params.data.status_name)
          }],
          ["approve_status", "Approve", "text", {
            width: 130, align: "center",
            cellRenderer: (params) => {
              let v = params.value || "N";
              let map = {
                Y: { text: "Approved", icon: "fa-check", color: "#16a34a", bg: "#e9f9ef", line: "#c4ecd3" },
                C: { text: this.ui.erp_fail, icon: "fa-times", color: "#dc2626", bg: "#fdecec", line: "#f7cfcf" },
                N: { text: this.ui.csm_remain_st_wait_approve_short, icon: "fa-clock", color: "#b45309", bg: "#fff5e5", line: "#f5dfb0" }
              };
              let s = map[v] || map.N;
              return `<span style="display:inline-flex;align-items:center;gap:5px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.7;color:${s.color};background:${s.bg};border:1px solid ${s.line};">`
                   + `<i class="fas ${s.icon}" style="font-size:9px;"></i>${s.text}</span>`;
            }
          }],
          ["due_date", this.ui.erp_due_date, "text", { width: 130, align: "center", cellRenderer: (p) => p.value ? this.$date(p.value, "DD/MM/YYYY") : "" }]
        ];
        agr.setHeader(agr.createHeaderFromArray(fields));
        agr.setDisplay(this.statusDetailList);
      },
      statusColorOf(name) {
        return this.statusColorMap[name] || "#c2c8d4";
      },
      tintOf(color, amt) {
        let m = /^#?([0-9a-f]{6})$/i.exec(color || "");
        if (!m) return color;
        let n = parseInt(m[1], 16);
        let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
        return `rgb(${Math.round(r + (255 - r) * amt)},${Math.round(g + (255 - g) * amt)},${Math.round(b + (255 - b) * amt)})`;
      },
      barGrad(color, horizontal) {
        let light = this.tintOf(color, .34);
        return horizontal
          ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: light }, { offset: 1, color }])
          : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color }, { offset: 1, color: light }]);
      },
      chartTip() {
        return {
          backgroundColor: "rgba(18,24,38,.94)",
          borderWidth: 0,
          padding: [11, 14],
          textStyle: { color: "#fff", fontSize: 12 },
          extraCssText: "border-radius:12px;box-shadow:0 18px 40px -14px rgba(10,16,30,.55);"
        };
      },
      zoomStyle(vertical) {
        return {
          borderColor: "transparent",
          backgroundColor: "#f7f8fc",
          fillerColor: "rgba(79,110,247,.10)",
          borderRadius: 8,
          showDetail: false,
          brushSelect: false,
          moveHandleSize: 0,
          handleStyle: { color: "#fff", borderColor: "#4f6ef7", borderWidth: 2, shadowBlur: 6, shadowColor: "rgba(79,110,247,.35)" },
          dataBackground: { lineStyle: { color: "#e2e7f2" }, areaStyle: { color: "#eef1f8" } },
          selectedDataBackground: { lineStyle: { color: "#c3cdf0" }, areaStyle: { color: "#dfe5f7" } },
          orient: vertical ? "vertical" : "horizontal"
        };
      },
      statusBadgeHtml(name) {
        let text = name || "";
        if (!text) return "";
        let c = this.statusColorOf(text);
        let m = /^#([0-9a-f]{6})$/i.exec(c);
        let n = m ? parseInt(m[1], 16) : null;
        let rgb = n == null ? "" : `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`;
        let bg = rgb ? `rgba(${rgb},.13)` : "#f4f6fb";
        let bd = rgb ? `rgba(${rgb},.32)` : "#e6eaf2";
        return `<span style="display:inline-flex;align-items:center;gap:5px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.7;color:${c};background:${bg};border:1px solid ${bd};">`
             + `<span style="width:6px;height:6px;border-radius:50%;background:${c};"></span>${text}</span>`;
      },
      jobNoCellHtml(job_no) {
        if (!job_no) return "";
        return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${job_no}" target="_blank" style="color:#4f6ef7;font-weight:700;text-decoration:none;">${job_no}</a>`;
      },
      statusCodeOf(name) {
        return this.statusCodeMap[name] || "";
      },
      isRejectRow(r) {
        return r.job_status === "N" || r.status === "R";
      },
      initials(name) {
        if (!name) return "?";
        let parts = name.trim().split(/\s+/);
        let txt = parts.length > 1 ? parts[0][0] + parts[1][0] : name.trim().substring(0, 2);
        return txt.toUpperCase();
      },
      async clickByCustomer(customer, statusName) {
        this.selectedCustomer = customer;
        this.clickedStatusFilter = statusName || "";
        this.search = { text: "", field: "job_no" };
        await this.loadDetail();
        this.$refs.modalByCustomer.openModal();
      },
      async clickAllCustomers() {
        this.selectedCustomer = { customer_name: this.ui.csm_remain_all_customers, customer_code: "" };
        this.clickedStatusFilter = "";
        this.search = { text: "", field: "job_no" };
        await this.loadDetail();
        this.$refs.modalByCustomer.openModal();
      },
      async loadDetail() {
        let f = this.filter;
        let p = [
          `customer_code=${encodeURIComponent(this.selectedCustomer.customer_code)}`,
          `text=${encodeURIComponent(this.search.text || "")}`,
          `field=${encodeURIComponent(this.search.field || "")}`,
          `year=${encodeURIComponent(f.year || "")}`,
          `serv_group=${encodeURIComponent((f.groups || []).join(","))}`,
          `serv_code=${encodeURIComponent((f.services || []).join(","))}`,
          `status_name=${encodeURIComponent(this.clickedStatusFilter || (f.statuses || []).join(","))}`,
          `job_priority=${encodeURIComponent((f.priorities || []).join(","))}`,
          `module_=${encodeURIComponent((f.modules || []).join(","))}`,
          `over_due=${encodeURIComponent(f.over_due || "")}`,
          `show_reject=${f.showReject ? "Y" : "N"}`,
          `worker_name=${encodeURIComponent((f.workers || []).join(","))}`,
          `requester_name=${encodeURIComponent((f.requesters || []).join(","))}`,
          `team_worker=${encodeURIComponent((f.teamWorkers || []).join(","))}`,
          `team_requester=${encodeURIComponent((f.teamRequesters || []).join(","))}`
        ].join("&");
        let act = `csm/report/DashBoard_RemainDetailByCustomer?${p}`;
        let rsp = await $xt.getServer(act);
        this.detailList = rsp.data || [];
        let ii = 1;
        $linq(this.detailList).foreach(d => {
          d.job_priority_text = this.priorityName(d.job_priority);
          d.job_priority_code = d.job_priority;
          d.job_date = this.$date(d.job_date, "DD/MM/YYYY");
          d.assign_date = this.$date(d.assign_date, "DD/MM/YYYY");
          d.ont = ii;
          ii++;
        });
        this.initTableDetail();
      },
      initTableDetail() {
        let agr = this.$refs.agr1;
        if (!agr) return;
        let fields = [
          ["ont", "No.", "text", { width: 70, align: "center", pinned: 'left' }],
          ["job_no", this.ui.erp_csm_no, "text", { width: 150, align: "left", pinned: 'left', cellRenderer: (params) => this.jobNoCellHtml(params.value) }],
          ["job_date", this.ui.csm_v2_date, "text", { width: 130, align: "center" }],
          ["assign_date", this.ui.csm_home_assign_date, "text", { width: 130, align: "center" }],
          ["task_service", this.ui.erp_service, "text", { width: 150, align: "left" }],
          ["task_subject", this.ui.csm_v2_subject, "text", { width: 220, align: "left" }],
          ...(this.is_mango ? [["module", this.ui.erp_module, "text", { width: 150, align: "left" }]] : []),
          ["request_by", this.ui.csm_home_req_by, "text", { width: 180 }],
          ["team_n_r", this.ui.csm_remain_team_requester, "text", { width: 180, align: "left" }],
          ["worker_empname", this.ui.csm_trn_worker, "text", { width: 170, align: "left" }],
          ["team_n_a", this.ui.csm_remain_team_worker, "text", { width: 180, align: "left" }],
          ["tester_empname", this.is_mango ? this.ui.csm_menu_tester : this.ui.csm_remain_qa, "text", { width: 170, align: "left" }],
          ["contract_user", this.ui.erp_contact_by, "text", { width: 200 }],
          ["assign_emptel", this.ui.erp_bd_phone, "text", { width: 130, align: "center" }],
          ["job_priority_text", this.ui.csm_home_job_priority, "text", {
            width: 130,
            align: "center",
            cellRenderer: (params) => {
              let code = params.data.job_priority_code || "";
              let text = params.data.job_priority_text;
              let cls = this.priorityStatusClass(code);
              return `<span class="${cls}" style="font-weight:700;">${text}</span>`;
            }
          }],
          ["status_name", "Status", "text", {
            width: 130,
            align: "center",
            cellRenderer: (params) => this.statusBadgeHtml(params.data.status_name)
          }]
        ];
        agr.setHeader(agr.createHeaderFromArray(fields));
        agr.setDisplay(this.detailList);
      },
      close() {
        this.$refs.modalByCustomer.closeModal();
      },
      priorityStatusClass(code) {
        var status = $linq(this.priorityCodeData).where(w => w.prioity_code == code).select(x => x.priority_status).firstOrDefault() || ''
        return status == '3' ? 'text-danger' : status == '2' ? 'text-warning' : 'text-info'
      },
      async analyzeWithAi() {
        if (!this.filteredRows.length) { $msg.alert(this.ui.erp_no_data, this.ui.csm_remain_load_before_analyze, "warning"); return; }
        this.aiLoading = true;
        this.aiResult = null;
        try {
          // aggregate ใน frontend — ส่งแค่ summary รายลูกค้า ไม่ใช่ raw rows
          let custMap = {};
          this.filteredRows.forEach(r => {
            let k = r.customer_code;
            if (!custMap[k]) custMap[k] = { customer_code: k, customer_name: r.customer_name || "", total: 0, overdue: 0, statuses: {}, workers: new Set() };
            let c = custMap[k];
            c.total++;
            if (r.over_due === "O") c.overdue++;
            let st = r.status_name || "Unknown";
            c.statuses[st] = (c.statuses[st] || 0) + 1;
            if (r.worker_empname) c.workers.add(r.worker_empname);
          });
          let customers = Object.values(custMap)
            .map(c => ({ customer_code: c.customer_code, customer_name: c.customer_name, total: c.total, overdue: c.overdue, statuses: c.statuses, workers: [...c.workers] }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 50);

          let workerLoad = {};
          this.filteredRows.forEach(r => { if (r.worker_empname) workerLoad[r.worker_empname] = (workerLoad[r.worker_empname] || 0) + 1; });
          let topWorkers = Object.entries(workerLoad).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, n]) => ({ worker: w, count: n }));

          let payload = {
            total_tasks: this.filteredRows.length,
            total_overdue: this.filteredRows.filter(r => r.over_due === "O").length,
            customers,
            top_workers: topWorkers
          };
          let rsp = await $xt.postServerJson("csm/report/DashBoard_AiAnalysis", payload);
          if (!rsp.success) throw new Error(rsp.error || "AI error");
          let parsed;
          try {
            parsed = typeof rsp.analysis === "string" ? JSON.parse(rsp.analysis) : rsp.analysis;
          } catch (pe) {
            throw new Error(this.ui.csm_remain_ai_unreadable);
          }
          this.aiResult = parsed;
        } catch (e) {
          $msg.alert(this.ui.csm_remain_ai_failed, e.message || String(e), "danger");
        } finally {
          this.aiLoading = false;
        }
      },
      /*  AI */
   async   loadData_Ai()
      {
        if (this.aiDataLoaded || this.aiDataLoading) return;
        this.aiDataLoading = true;
        try {
          let act = `csm/report/Get_dataList`;
          let rsp = await $xt.getServer(act);
          this.listData_forAI = rsp.dataList || [];
          this.aiDataLoaded = true;
        } catch (e) {
          $msg.alert(this.ui.csm_remain_load_failed, e.message || String(e), "danger");
        } finally {
          this.aiDataLoading = false;
        }
      },
  async    openChat() {

        this.$refs.modalChat.openModal();
        this.$nextTick(() => {
          this.scrollChatToBottom();
          let box = this.$refs.chatInputBox;
          if (box) box.focus();
        });
      },
      clearChat() {
        this.chatMessages = [];
      },
      buildChatSnapshot() {
        let rows = this.chatRows;
        // === ภาพรวม (aggregate รายลูกค้า) — ใช้ตอบคำถามภาพรวม ===
        let custMap = {};
        rows.forEach(r => {
          let k = r.customer_code;
          if (!custMap[k]) custMap[k] = { customer_code: k, customer_name: r.customer_name || "", total: 0, overdue: 0, statuses: {}, workers: new Set() };
          let c = custMap[k];
          c.total++;
          if (r.over_due === "O") c.overdue++;
          let st = r.status_name || "Unknown";
          c.statuses[st] = (c.statuses[st] || 0) + 1;
          if (r.worker_empname) c.workers.add(r.worker_empname);
        });
        let customers = Object.values(custMap)
          .map(c => ({ customer_code: c.customer_code, customer_name: c.customer_name, total: c.total, overdue: c.overdue, statuses: c.statuses, workers: [...c.workers] }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 50);

        let workerLoad = {};
        rows.forEach(r => { if (r.worker_empname) workerLoad[r.worker_empname] = (workerLoad[r.worker_empname] || 0) + 1; });
        let topWorkers = Object.entries(workerLoad).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, n]) => ({ worker: w, count: n }));

        // === รายละเอียดระดับเอกสาร (trimmed rows) — ใช้ตอบคำถามว่า "ทำไมใบนี้ช้า" ===
        const ROW_CAP = 200;
        let fmtDate = (d) => d ? this.$date(d, "DD/MM/YYYY") : "";
        let sortedRows = rows.slice().sort((a, b) => {
          // เลยกำหนดมาก่อน แล้วเรียงตามวันที่เปิดเอกสารเก่าสุดก่อน (ค้างนาน = น่าสนใจ)
          let ao = a.over_due === "O" ? 0 : 1;
          let bo = b.over_due === "O" ? 0 : 1;
          if (ao !== bo) return ao - bo;
          return String(a.open_docdate || a.job_date || "").localeCompare(String(b.open_docdate || b.job_date || ""));
        });
        let truncated = sortedRows.length > ROW_CAP;
        let tasks = sortedRows.slice(0, ROW_CAP).map(r => {
          // closeApprove = สถานะอนุมัติปิดงาน/QC (Not Approve / Approve Tester / Approve) — คนละตัวกับ approve_status
          let closeApprove = r.status_name_Approve || (r.approve_status === "Y" ? "Approve" : this.ui.csm_remain_st_not_approve);
          let startApproved = r.approve_status === "Y"; // อนุมัติให้เริ่มงานแล้วหรือยัง
          let hasWorkerFlow = !!(r.worker_start_date || r.worker_end_date || r.worker_send_date);
          // ระบุ "จุดที่ค้างอยู่ตอนนี้" จากหลักฐานที่มีจริง ไม่เดาสาเหตุเกินข้อมูล
          let stage;
          if (!startApproved) {
            stage = this.ui.csm_remain_st_wait_start_approve;
          } else if (r.worker_send_date) {
            stage = r.tester_approve === "Y"
              ? this.ui.csm_remain_st_tested_wait_close
              : this.ui.csm_remain_st_sent_wait_tester;
          } else if (r.worker_end_date) {
            stage = this.ui.csm_remain_st_done_not_sent;
          } else if (r.worker_start_date) {
            stage = this.ui.csm_remain_st_started_not_done;
          } else if (hasWorkerFlow === false) {
            stage = this.ui.csm_remain_st_approved_no_progress;
          } else {
            stage = this.ui.csm_remain_st_approved_not_started;
          }
          // สถานะการอนุมัติเอกสาร — วิเคราะห์จาก approve_remark_by_doc (ใครอนุมัติ/ยกเลิก/รออนุมัติ)
          let remark = r.approve_remark_by_doc || "";
          let docApprove;
          if (!remark) docApprove = this.ui.csm_remain_st_no_doc_approval;
          else if (/revoked approval|Document Rejected/i.test(remark)) docApprove = this.ui.csm_remain_st_doc_cancelled;
          else if (/Pending approval|Waiting for Document Approval/i.test(remark)) docApprove = this.ui.csm_remain_st_doc_pending;
          else if (/Document Approved|Approved by this person/i.test(remark)) docApprove = this.ui.csm_remain_st_doc_approved;
          else docApprove = this.ui.csm_remain_st_doc_unknown;
          return {
            job_no: r.job_no,
            customer: r.customer_name,
            service: r.serv_name,
            service_group: r.serv_group_name,
            subject: r.task_subject,
            status: r.status_name,
            start_approve: startApproved ? this.ui.csm_remain_st_start_approved : this.ui.csm_remain_st_start_not_approved,
            close_approve: closeApprove,
            doc_approve: docApprove,
            tester_approve: r.tester_approve === "Y" ? this.ui.csm_remain_st_pass : (r.tester_approve === "C" ? this.ui.erp_fail : this.ui.csm_remain_st_not_tested),
            priority: this.priorityName(r.job_priority) || r.priority_name || r.job_priority,
            worker: r.worker_empname || "",
            team_worker: r.team_n_a || "",
            tester: r.tester_empname || "",
            requester: r.request_by || "",
            team_requester: r.team_n_r || "",
            open_doc_date: fmtDate(r.open_docdate || r.job_date),
            job_date: fmtDate(r.job_date),
            due_date: fmtDate(r.due_date),
            approve_date: fmtDate(r.approve_date),
            worker_start_date: r.worker_start_date ? fmtDate(r.worker_start_date) : this.ui.csm_remain_st_not_started,
            worker_end_date: r.worker_end_date ? fmtDate(r.worker_end_date) : this.ui.csm_remain_st_not_finished,
            worker_send_date: r.worker_send_date ? fmtDate(r.worker_send_date) : this.ui.csm_remain_st_not_sent,
            tester_approve_date: fmtDate(r.tester_approve_date),
            over_due: r.over_due === "O" ? this.ui.csm_case_overdue : this.ui.erp_normal,
            over_due_day: r.over_due_day || "",       // เช่น "12 days" — เลยกำหนดมากี่วัน (จาก SQL)
            days_until_due: r.days_until_due || "",    // เช่น "5 days" — เหลือเวลาอีกกี่วัน (จาก SQL)
            approve_history: r.approve_remark_by_doc || "",  // ประวัติการอนุมัติแต่ละขั้น (จาก SQL)
            current_stage: stage
          };
        });

        return {
          total_tasks: rows.length,
          total_overdue: rows.filter(r => r.over_due === "O").length,
          customers,
          top_workers: topWorkers,
          tasks,
          tasks_truncated: truncated,
          tasks_shown: tasks.length
        };
      },
      async sendChat(presetText) {
        let text = (presetText != null ? presetText : this.chatInput).trim();
        if (!text || this.chatLoading) return;
        if (!this.chatRows.length) { $msg.alert(this.ui.erp_no_data, this.ui.csm_remain_no_data_for_filter, "warning"); return; }

        this.chatMessages.push({ role: "user", content: text });
        this.chatInput = "";
        this.chatLoading = true;
        this.aiStreamIdx = -1;
        this.$nextTick(() => this.scrollChatToBottom());

        try {
          let history = this.chatMessages
            .filter(m => (m.role === "user" || m.role === "assistant") && !m.streaming)
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content }));

          const ROW_CAP = 2500;
          let payload = {
            question: text,
            history,
            total_rows: this.chatRows.length,
            rows_truncated: this.chatRows.length > ROW_CAP,
            dataList: this.chatRows
          };
          let rsp = await $xt.postServerJson("csm/report/DashBoard_AiChatStream", payload);
          if (!rsp.success) throw new Error(rsp.error || "AI stream error");
        } catch (e) {
          this.chatMessages.push({ role: "assistant", content: "⚠️ " + this.ui.erp_error + ": " + (e.message || String(e)) });
          this.aiStreamIdx = -1;
          this.chatLoading = false;
          this.$nextTick(() => this.scrollChatToBottom());
        }
      },
      scrollChatToBottom() {
        let el = this.$refs.chatBody;
        if (el) el.scrollTop = el.scrollHeight;
      },
      renderChat(text) {
        if (!text) return "";
        // escape HTML แล้วแปลง markdown เบื้องต้น (bold, รายการ, ขึ้นบรรทัด)
        let safe = String(text)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        safe = safe.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
        safe = safe.replace(/^\s*[-*]\s+(.*)$/gm, "<li>$1</li>");
        safe = safe.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
        safe = safe.replace(/\n/g, "<br>");
        return safe;
      },
      priorityName(code) {
        return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || ''
      },
      printSummary() {
        let date = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
        let filterDesc = [];
        let f = this.filter;
        if (f.year) filterDesc.push(`ปี: ${f.year}`);
        if (f.group) filterDesc.push(`Service Group: ${f.group}`);
        if (f.service) filterDesc.push(`Service: ${f.service}`);
        if (f.status) filterDesc.push(`Status: ${f.status}`);
        if (f.priority) filterDesc.push(`Priority: ${f.priority}`);
        if (f.modules.length) filterDesc.push(`Module: ${f.modules.join(", ")}`);
        if (f.over_due) filterDesc.push(`Over Due: ${f.over_due === "O" ? this.ui.csm_case_overdue + (f.over_due_days !== "" ? ` (≥ ${f.over_due_days} วัน)` : "") : this.ui.csm_remain_not_overdue}`);
        if (f.statusAppr) filterDesc.push(`Status Approve: ${this.statusApprLabel(f.statusAppr)}`);
        if (f.workers.length) filterDesc.push(`Worker: ${f.workers.join(", ")}`);
        if (f.requesters.length) filterDesc.push(`Requester: ${f.requesters.join(", ")}`);
        if (f.teamWorkers.length) filterDesc.push(`Teams Worker: ${f.teamWorkers.map(c => this.teamWorkerName(c)).join(", ")}`);
        if (f.teamRequesters.length) filterDesc.push(`Teams Requester: ${f.teamRequesters.map(c => this.teamRequesterName(c)).join(", ")}`);
        if (f.text) filterDesc.push(`ค้นหา: ${f.text}`);

        let topRows = this.filteredList.slice().sort((a, b) => (b.tasktot || 0) - (a.tasktot || 0));
        let topHtml = topRows.map((c, i) => {
          let chips = c.status_name.map((s, si) =>
            `<span style="display:inline-block;margin:1px 3px;padding:1px 7px;border-radius:5px;font-size:10px;background:${this.statusColorOf(s)};color:#fff;">${s} ${c.taskqty[si]}</span>`
          ).join("");
          return `<tr>
            <td style="text-align:center;padding:5px 8px;border-bottom:1px solid #eee;">${i + 1}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.customer_code || ""}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.customer_name || ""}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #eee;">${chips}</td>
            <td style="text-align:center;padding:5px 8px;border-bottom:1px solid #eee;font-weight:700;color:#ef5a6f;">${c.tasktot || 0}</td>
          </tr>`;
        }).join("");

        let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
          <title>CSM - งานคงค้างรายลูกค้า</title>
          <style>
            body{font-family:'Sarabun',sans-serif;font-size:13px;color:#1e2330;margin:0;padding:20px;}
            h1{font-size:18px;margin:0 0 4px;}
            .sub{font-size:12px;color:#8a93a6;margin-bottom:12px;}
            .stats{display:flex;gap:16px;margin-bottom:14px;}
            .stat{border:1px solid #eceff5;border-radius:8px;padding:10px 16px;min-width:140px;}
            .stat__label{font-size:11px;color:#8a93a6;}
            .stat__value{font-size:20px;font-weight:700;}
            .stat__value small{font-size:11px;color:#8a93a6;margin-left:4px;}
            table{width:100%;border-collapse:collapse;}
            thead tr{background:#f4f6fb;}
            thead th{padding:7px 8px;text-align:left;font-size:12px;font-weight:700;border-bottom:2px solid #4f6ef7;}
            @media print{body{padding:0;} @page{margin:15mm;}}
          </style></head><body>
          <h1>${this.ui.csm_remain_print_title}</h1>
          <div class="sub">${this.ui.csm_remain_print_date}: ${date} &nbsp;|&nbsp; ${window.auth?.mainname || ""}${filterDesc.length ? "&nbsp;|&nbsp; ${this.ui.csm_remain_conditions}: " + filterDesc.join(" / ") : ""}</div>
          <div class="stats">
            <div class="stat"><div class="stat__label">${this.ui.csm_remain_customers_with_work}</div><div class="stat__value">${this.summary.customer_count || 0}<small>${this.ui.csm_remain_unit_customer}</small></div></div>
            <div class="stat"><div class="stat__label">${this.ui.csm_remain_total_work}</div><div class="stat__value">${this.summary.task_total || 0}<small>${this.ui.csm_remain_unit_item}</small></div></div>
            <div class="stat"><div class="stat__label">${this.ui.csm_remain_avg_per_customer}</div><div class="stat__value">${this.avgPerCustomer}<small>${this.ui.csm_remain_unit_per_customer}</small></div></div>
            <div class="stat"><div class="stat__label">${this.ui.csm_remain_projects_with_work}</div><div class="stat__value">${this.summary.project_count || 0}<small>${this.ui.csm_v2_project}</small></div></div>
            <div class="stat"><div class="stat__label">${this.ui.csm_remain_avg_per_project}</div><div class="stat__value">${this.avgPerProject}<small>${this.ui.csm_remain_unit_per_project}</small></div></div>
          </div>
          <table>
            <thead><tr>
              <th style="width:40px;text-align:center;">${this.ui.erp_no}</th>
              <th style="width:110px;">${this.ui.erp_customer_code}</th>
              <th>${this.ui.erp_cust_name}</th>
              <th>${this.ui.erp_status}</th>
              <th style="width:60px;text-align:center;">${this.ui.csm_remain_col_remain}</th>
            </tr></thead>
            <tbody>${topHtml}</tbody>
          </table>
        </body></html>`;

        let w = window.open("", "_blank", "width=900,height=700");
        w.document.write(html);
        w.document.close();
        w.onload = () => { w.focus(); w.print(); };
      }
    },
    computed: {
      ...mapState(['connectionCodeData', 'requestCodeData', 'priorityCodeData', 'serviceCodeData', 'configData', 'config', 'activeconfig', 'configReadlist']),
      priorityCodeData() { return store.state.priorityCodeData },
      activeFilterChips() {
        let f = this.filter;
        let chips = [];
        if (f.year) chips.push({ icon: "fas fa-calendar-alt", label: this.ui.erp_year, value: f.year, clear: () => { this.filter.year = ""; } });
        if (f.text) chips.push({ icon: "fas fa-search", label: this.ui.search, value: f.text, clear: () => { this.filter.text = ""; } });
        if (f.groups.length) chips.push({ icon: "fas fa-cogs", label: this.ui.csm_remain_service_group, value: f.groups.map(c => this.groupName(c)).join(", "), clear: () => { this.filter.groups = []; this.filter.services = []; } });
        if (f.services.length) chips.push({ icon: "fas fa-cog", label: this.ui.erp_service, value: f.services.map(c => this.serviceName(c)).join(", "), clear: () => { this.filter.services = []; } });
        if (f.statuses.length) chips.push({ icon: "fas fa-flag", label: this.ui.erp_status, value: f.statuses.join(", "), clear: () => { this.filter.statuses = []; } });
        if (f.priorities.length) chips.push({ icon: "fas fa-bolt", label: this.ui.erp_priority, value: f.priorities.map(c => this.priorityLabel(c)).join(", "), clear: () => { this.filter.priorities = []; } });
        if (f.modules.length) chips.push({ icon: "fas fa-cube", label: this.ui.erp_module, value: f.modules.join(", "), clear: () => { this.filter.modules = []; } });
        if (f.over_due) chips.push({ icon: "fas fa-clock", label: this.ui.csm_case_overdue, value: f.over_due === "O" ? this.ui.csm_case_overdue + (f.over_due_days !== "" ? ` (≥ ${f.over_due_days} วัน)` : "") : this.ui.csm_remain_not_overdue, clear: () => { this.filter.over_due = ""; this.filter.over_due_days = ""; } });
        if (f.statusAppr) chips.push({ icon: "fas fa-stamp", label: this.ui.csm_remain_status_approve, value: this.statusApprLabel(f.statusAppr), clear: () => { this.filter.statusAppr = ""; } });
        if (f.workers.length) chips.push({ icon: "fas fa-user-tie", label: this.ui.csm_trn_worker, value: f.workers.join(", "), clear: () => { this.filter.workers = []; } });
        if (f.requesters.length) chips.push({ icon: "fas fa-user", label: this.ui.erp_requester, value: f.requesters.join(", "), clear: () => { this.filter.requesters = []; } });
        if (f.teamWorkers.length) chips.push({ icon: "fas fa-users-cog", label: this.ui.csm_remain_team_worker, value: f.teamWorkers.map(c => this.teamWorkerName(c)).join(", "), clear: () => { this.filter.teamWorkers = []; } });
        if (f.teamRequesters.length) chips.push({ icon: "fas fa-users", label: this.ui.csm_remain_team_requester, value: f.teamRequesters.map(c => this.teamRequesterName(c)).join(", "), clear: () => { this.filter.teamRequesters = []; } });
        if (f.testerQcs.length) chips.push({ icon: "fas fa-user-check", label: this.is_mango ? this.ui.csm_menu_tester : this.ui.csm_remain_qa, value: f.testerQcs.join(", "), clear: () => { this.filter.testerQcs = []; } });
        if (f.showReject) chips.push({ icon: "fas fa-ban", label: this.ui.csm_remain_show, value: "Reject", clear: () => { this.filter.showReject = false; } });
        return chips;
      },
      filteredWorkers() {
        let q = (this.workerSearch || "").trim().toLowerCase();
        return q ? this.workers.filter(w => w.toLowerCase().includes(q)) : this.workers;
      },
      filteredRequesters() {
        let q = (this.requesterSearch || "").trim().toLowerCase();
        return q ? this.requesters.filter(r => r.toLowerCase().includes(q)) : this.requesters;
      },
      filteredTeamWorkers() {
        let q = (this.teamWorkerSearch || "").trim().toLowerCase();
        return q ? this.teamWorkersList.filter(t => t.team_name.toLowerCase().includes(q)) : this.teamWorkersList;
      },
      filteredTeamRequesters() {
        let q = (this.teamRequesterSearch || "").trim().toLowerCase();
        return q ? this.teamRequestersList.filter(t => t.team_name.toLowerCase().includes(q)) : this.teamRequestersList;
      },
      filteredTesterQcs() {
        let q = (this.testerQcSearch || "").trim().toLowerCase();
        return q ? this.testerQcList.filter(t => t.toLowerCase().includes(q)) : this.testerQcList;
      },
      filteredModules() {
        let q = (this.moduleSearch || "").trim().toLowerCase();
        return q ? this.modules.filter(m => m.toLowerCase().includes(q)) : this.modules;
      },
      allStatusNames() {
        let src = this.filter.showReject ? this.rows : this.rows.filter(r => !this.isRejectRow(r));
        let names = [...new Set(src.map(r => r.status_name).filter(Boolean))];
        let order = this.statusList.map(s => s.name);
        return names.sort((a, b) => {
          let ia = order.indexOf(a);
          let ib = order.indexOf(b);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      },
      filteredGroups() {
        let q = (this.groupSearch || "").trim().toLowerCase();
        return q ? this.serviceGroups.filter(g => g.serv_group_name.toLowerCase().includes(q)) : this.serviceGroups;
      },
      servicesInGroup() {
        if (!this.filter.groups.length) return this.services;
        return this.services.filter(s => this.filter.groups.includes(s.serv_group_code));
      },
      servicesGrouped() {
        let src = this.servicesInGroup;
        let order = [];
        let map = {};
        src.forEach(s => {
          let code = s.serv_group_code || "other";
          if (!map[code]) {
            map[code] = { serv_group_code: code, serv_group_name: s.serv_group_name || this.ui.csm_remain_others, services: [] };
            order.push(code);
          }
          map[code].services.push(s);
        });
        return order.map(c => map[c]);
      },
      filteredServicesGrouped() {
        let q = (this.serviceSearch || "").trim().toLowerCase();
        if (!q) return this.servicesGrouped;
        return this.servicesGrouped.map(grp => ({
          ...grp,
          services: grp.services.filter(s => s.serv_name.toLowerCase().includes(q))
        })).filter(grp => grp.services.length);
      },
      filteredRows() {
        let f = this.filter;
        let txt = (f.text || "").trim().toLowerCase();
        return this.rows.filter(r => {
          if (!f.showReject && this.isRejectRow(r)) return false;
          if (txt && !((r.customer_name || "").toLowerCase().includes(txt) || (r.customer_code || "").toLowerCase().includes(txt))) return false;
          if (f.year && String(r.job_year) != String(f.year)) return false;
          if (f.groups.length && !f.groups.includes(r.serv_group_code)) return false;
          if (f.services.length && !f.services.includes(r.serv_code)) return false;
          if (f.statuses.length && !f.statuses.includes(r.status_name)) return false;
          if (f.priorities.length && !f.priorities.includes(r.job_priority)) return false;
          if (f.modules.length && !f.modules.includes(r.module_)) return false;
          if (f.over_due && r.over_due !== f.over_due) return false;
          if (f.over_due === "O" && f.over_due_days !== "" && Number(r.over_due_days || 0) < Number(f.over_due_days)) return false;
          if (f.statusAppr && r.status_appr !== f.statusAppr) return false;
          if (f.workers.length && !f.workers.includes(r.worker_empname)) return false;
          if (f.requesters.length && !f.requesters.includes(r.request_by)) return false;
          if (f.testerQcs.length && !f.testerQcs.includes(r.tester_empname)) return false;
          if (f.teamWorkers.length) {
            let rowTeams = (r.team_c_a || "").split(",").map(s => s.trim()).filter(Boolean);
            if (!f.teamWorkers.some(tc => rowTeams.includes(tc))) return false;
          }
          if (f.teamRequesters.length) {
            let rowTeams = (r.team_c_r || "").split(",").map(s => s.trim()).filter(Boolean);
            if (!f.teamRequesters.some(tc => rowTeams.includes(tc))) return false;
          }
          return true;
        });
      },
      // map status code -> status name (ก้อน listData_forAI มีแต่ status code)
      statusNameByCode() {
        let m = {};
        (this.statusList || []).forEach(s => { m[s.status] = s.name; });
        return m;
      },
      chatYearOptions() {
        let years = new Set();
        (this.listData_forAI || []).forEach(r => { if (r.job_year) years.add(String(r.job_year)); });
        return Array.from(years).sort().reverse();
      },
      // เอา listData_forAI มากรองด้วย filter เดียวกับ dashboard เพื่อให้ "กรองหน้าจอแล้วถาม" ยังทำงาน
      aiFilteredRows() {
        let f = this.filter;
        let txt = (f.text || "").trim().toLowerCase();
        let nameByCode = this.statusNameByCode;
        return (this.listData_forAI || []).filter(r => {
          if (!f.showReject && this.isRejectRow(r)) return false;
          if (txt && !((r.customer_name || "").toLowerCase().includes(txt) || (r.customer_code || "").toLowerCase().includes(txt))) return false;
          if (f.year && String(r.job_year) != String(f.year)) return false;
          if (f.groups.length && !f.groups.includes(r.serv_group_code)) return false;
          if (f.services.length && !f.services.includes(r.serv_code)) return false;
          if (f.statuses.length && !f.statuses.includes(nameByCode[r.status] || r.status)) return false;
          if (f.priorities.length && !f.priorities.includes(r.job_priority)) return false;
          if (f.modules.length && !f.modules.includes(r.module_)) return false;
          if (f.over_due && r.over_due !== f.over_due) return false;
          if (f.workers.length && !f.workers.includes(r.worker_empname)) return false;
          if (f.requesters.length && !f.requesters.includes(r.request_by)) return false;
          if (f.testerQcs.length && !f.testerQcs.includes(r.tester_empname)) return false;
          if (this.chatYearFilter && String(r.job_year) !== String(this.chatYearFilter)) return false;
          if (f.teamWorkers.length) {
            let rowTeams = (r.team_c_a || "").split(",").map(s => s.trim()).filter(Boolean);
            if (!f.teamWorkers.some(tc => rowTeams.includes(tc))) return false;
          }
          if (f.teamRequesters.length) {
            let rowTeams = (r.team_c_r || "").split(",").map(s => s.trim()).filter(Boolean);
            if (!f.teamRequesters.some(tc => rowTeams.includes(tc))) return false;
          }
          return true;
        }).map(r => ({ ...r, status_name: r.status_name || nameByCode[r.status] || r.status }));
      },
      chatRows() {
        if (!this.chatYearFilter) return this.listData_forAI || [];
        return (this.listData_forAI || []).filter(r => String(r.job_year) === String(this.chatYearFilter));
      },
      aiCustomerCount() {
        return new Set(this.chatRows.map(r => r.customer_code)).size;
      },
      statusDetailList() {
        let txt = (this.statusSearch || "").trim().toLowerCase();
        return this.filteredRows.filter(r => {
          if (this.modalMode === "worker") {
            if (r.worker_empname !== this.selectedWorker) return false;
            if (this.selectedWorkerStatus && r.status_name !== this.selectedWorkerStatus) return false;
          } else if (this.modalMode === "tester") {
            let name = r.tester_empname || this.ui.csm_trn_not_specified;
            if (name !== this.selectedTester) return false;
            if (this.selectedTesterStatus && r.status_name !== this.selectedTesterStatus) return false;
          } else {
            if (r.status_name !== this.selectedStatus) return false;
          }
          if (txt && !(
            (r.customer_name || "").toLowerCase().includes(txt) ||
            (r.job_no || "").toLowerCase().includes(txt) ||
            (r.serv_name || "").toLowerCase().includes(txt)
          )) return false;
          return true;
        }).slice().sort((a, b) => String(b.job_date || "").localeCompare(String(a.job_date || "")));
      },
      groupedList() {
        let map = {};
        this.filteredRows.forEach(r => {
          let key = r.customer_code;
          if (!map[key]) {
            map[key] = { customer_code: r.customer_code, customer_name: r.customer_name, _st: {}, _jobs: new Set(), tasktot: 0 };
          }
          let g = map[key];
          g._st[r.status_name] = (g._st[r.status_name] || 0) + 1;
          g.tasktot += 1;
          if (r.job_no) g._jobs.add(r.job_no);
        });
        return Object.keys(map).map(k => {
          let g = map[k];
          let names = Object.keys(g._st);
          return {
            customer_code: g.customer_code,
            customer_name: g.customer_name,
            status_name: names,
            status: names.map(n => this.statusCodeOf(n)),
            taskqty: names.map(n => g._st[n]),
            tasktot: g.tasktot,
            doc_count: g._jobs.size
          };
        });
      },
      filteredList() {
        let sorted = this.groupedList.slice();
        if (this.filter.sort === "qty_asc") {
          sorted.sort((a, b) => (a.tasktot || 0) - (b.tasktot || 0));
        } else if (this.filter.sort === "name_asc") {
          sorted.sort((a, b) => (a.customer_name || "").localeCompare(b.customer_name || "", "th"));
        } else {
          sorted.sort((a, b) => (b.tasktot || 0) - (a.tasktot || 0));
        }
        return sorted;
      },
      summary() {
        let t = this.filteredRows.length;
        let c = this.groupedList.length;
        let p = new Set(this.filteredRows.filter(r => r.pre_event).map(r => r.pre_event)).size;
        console.log('rrrr', p, 'rows total', this.rows.length, 'filteredRows total', this.filteredRows.length, 'rows with pre_event', this.rows.filter(r => r.pre_event).length, 'sample pre_event values', this.rows.slice(0, 5).map(r => r.pre_event))
        return { customer_count: c, task_total: t, project_count: p };
      },
      avgPerCustomer() {
        let c = this.summary.customer_count || 0;
        let t = this.summary.task_total || 0;
        return c ? Math.round((t / c) * 10) / 10 : 0;
      },
      avgPerProject() {
        let p = this.summary.project_count || 0;
        let t = this.summary.task_total || 0;
        return p ? Math.round((t / p) * 10) / 10 : 0;
      },
      topCustomers() {
        return this.groupedList.slice()
          .sort((a, b) => (b.doc_count || 0) - (a.doc_count || 0))
          .slice(0, 10);
      },
      topMax() {
        return this.topCustomers.length ? (this.topCustomers[0].doc_count || 0) : 0;
      },
         is_mango() {
          let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
          return isMango == 'Y' ? true : false
        },
      overdueCount() {
        return this.filteredRows.filter(r => r.over_due === "O").length;
      },
      overduePercent() {
        let t = this.filteredRows.length;
        return t ? Math.round((this.overdueCount / t) * 100) : 0;
      },
      workerWorkload() {
        let map = {};
        this.filteredRows.forEach(r => {
          let w = r.worker_empname || this.ui.csm_trn_not_specified;
          if (!map[w]) map[w] = { worker: w, total: 0, statuses: {} };
          map[w].total++;
          let st = r.status_name || "Unknown";
          map[w].statuses[st] = (map[w].statuses[st] || 0) + 1;
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
      },
      workerChartOption() {
        let statusNames = this.allStatusNames;
        let workers = this.workerWorkload;
        let source = workers.map(w => {
          let row = { worker: w.worker };
          statusNames.forEach(s => { row[s] = w.statuses[s] || 0; });
          return row;
        });
        const _pal = ["#4f6ef7","#22d3ee","#a78bfa","#34d399","#fb923c","#f472b6","#60a5fa","#facc15","#4ade80","#818cf8","#f87171","#e879f9"];
        let statusColor = statusNames.map((n, i) => this.statusColorMap[n] || _pal[i % _pal.length]);
        let lastSeries = statusNames[statusNames.length - 1];
        let totalMap = {};
        workers.forEach(w => { totalMap[w.worker] = w.total; });
        return {
          color: statusColor,
          textStyle: { fontFamily: "'Manrope', 'Sarabun', sans-serif" },
          animationDuration: 700,
          animationEasing: "cubicOut",
          animationDelay: idx => idx * 12,
          legend: {
            top: 4, right: 6, type: "scroll",
            icon: "circle", itemWidth: 9, itemHeight: 9, itemGap: 14,
            inactiveColor: "#ccd3e0",
            pageIconColor: "#4f6ef7", pageIconInactiveColor: "#cfd6e4", pageIconSize: 10,
            pageTextStyle: { color: "#8a93a6", fontSize: 11 },
            textStyle: { color: "#5b6479", fontSize: 11.5 }, data: statusNames
          },
          tooltip: Object.assign(this.chartTip(), {
            trigger: "axis",
            axisPointer: { type: "shadow", shadowStyle: { color: "rgba(79,110,247,.06)" } },
            formatter: (params) => {
              let name = params[0] ? params[0].axisValue : "";
              let hovered = this._workerHoveredSeries;
              if (hovered) {
                let p = params.find(p => p.seriesName === hovered);
                if (p) {
                  let v = (p.value && p.value[p.seriesName]) || 0;
                  let total = params.reduce((s, q) => s + ((q.value && q.value[q.seriesName]) || 0), 0);
                  let pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return `<div style="font-weight:700;margin-bottom:6px;">${name}</div>` +
                    `<div style="display:flex;align-items:center;gap:6px;">${p.marker}<span style="flex:1;">${hovered}</span><b>${v}</b></div>` +
                    `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:4px;font-size:11px;color:#b0bec5;">รวม <b style="color:#fff;">${total}</b>&ensp;(${pct}%)</div>`;
                }
              }
              let txt = `<div style="font-weight:700;margin-bottom:6px;">${name}</div>`;
              let total = 0;
              params.forEach(p => {
                let v = (p.value && p.value[p.seriesName]) || 0;
                total += v;
                if (!v) return;
                txt += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">${p.marker}<span style="flex:1;">${p.seriesName}</span><b>${v}</b></div>`;
              });
              txt += `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:6px;">รวม <b>${total}</b></div>`;
              return txt;
            }
          }),
          dataset: { dimensions: ["worker", ...statusNames], source },
          grid: { left: 16, right: 30, top: 42, bottom: 12, containLabel: true },
          dataZoom: [Object.assign(this.zoomStyle(true), {
            type: "slider", right: 6,
            start: 0, end: workers.length ? Math.min(100, Math.round(10 / workers.length * 100)) : 100,
            width: 10,
            show: workers.length > 10
          }), {
            type: "inside", orient: "vertical", zoomOnMouseWheel: false, moveOnMouseWheel: true
          }],
          xAxis: {
            type: "value",
            axisLine: { show: false }, axisTick: { show: false },
            splitLine: { lineStyle: { color: "#f0f3fa", type: "dashed" } },
            axisLabel: { color: "#a3abbd", fontSize: 11 }
          },
          yAxis: {
            type: "category",
            axisTick: { show: false }, axisLine: { show: false },
            axisLabel: {
              fontSize: 11.5, color: "#5b6479", margin: 12,
              formatter: v => `{n|${v}}  {c|${totalMap[v] || 0}}`,
              rich: {
                n: { color: "#5b6479", fontSize: 11.5 },
                c: {
                  color: "#3d4666", fontSize: 10.5, fontWeight: 700,
                  backgroundColor: "#eef1f8", borderRadius: 5, padding: [2, 6, 2, 6]
                }
              }
            }
          },
          series: statusNames.map((k, i) => ({
            name: k, type: "bar", stack: "wl", barMaxWidth: 18,
            emphasis: { focus: "series" },
            blur: { itemStyle: { opacity: .22 } },
            itemStyle: {
              color: this.barGrad(statusColor[i], true),
              borderColor: "#fff",
              borderWidth: 1.5,
              borderRadius: k === lastSeries ? [0, 7, 7, 0] : (k === statusNames[0] ? [3, 0, 0, 3] : 0)
            },
            encode: { x: k, y: "worker" }
          }))
        };
      },
      testerTestload() {
        if (!this.is_mango) return [];
        let map = {};
        this.filteredRows.forEach(r => {
          let t = r.tester_empname || this.ui.csm_trn_not_specified;
          if (!map[t]) map[t] = { tester: t, total: 0, statuses: {} };
          map[t].total++;
          let st = r.status_name || "Unknown";
          map[t].statuses[st] = (map[t].statuses[st] || 0) + 1;
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
      },
      testerChartOption() {
        let statusNames = this.allStatusNames;
        let testers = this.testerTestload;
        let source = testers.map(t => {
          let row = { tester: t.tester };
          statusNames.forEach(s => { row[s] = t.statuses[s] || 0; });
          return row;
        });
        const _pal = ["#4f6ef7","#22d3ee","#a78bfa","#34d399","#fb923c","#f472b6","#60a5fa","#facc15","#4ade80","#818cf8","#f87171","#e879f9"];
        let statusColor = statusNames.map((n, i) => this.statusColorMap[n] || _pal[i % _pal.length]);
        let lastSeries = statusNames[statusNames.length - 1];
        let totalMap = {};
        testers.forEach(t => { totalMap[t.tester] = t.total; });
        return {
          color: statusColor,
          textStyle: { fontFamily: "'Manrope', 'Sarabun', sans-serif" },
          animationDuration: 700,
          animationEasing: "cubicOut",
          animationDelay: idx => idx * 12,
          legend: {
            top: 4, right: 6, type: "scroll",
            icon: "circle", itemWidth: 9, itemHeight: 9, itemGap: 14,
            inactiveColor: "#ccd3e0",
            pageIconColor: "#4f6ef7", pageIconInactiveColor: "#cfd6e4", pageIconSize: 10,
            pageTextStyle: { color: "#8a93a6", fontSize: 11 },
            textStyle: { color: "#5b6479", fontSize: 11.5 }, data: statusNames
          },
          tooltip: Object.assign(this.chartTip(), {
            trigger: "axis",
            axisPointer: { type: "shadow", shadowStyle: { color: "rgba(79,110,247,.06)" } },
            formatter: (params) => {
              let name = params[0] ? params[0].axisValue : "";
              let hovered = this._testerHoveredSeries;
              if (hovered) {
                let p = params.find(p => p.seriesName === hovered);
                if (p) {
                  let v = (p.value && p.value[p.seriesName]) || 0;
                  let total = params.reduce((s, q) => s + ((q.value && q.value[q.seriesName]) || 0), 0);
                  let pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return `<div style="font-weight:700;margin-bottom:6px;">${name}</div>` +
                    `<div style="display:flex;align-items:center;gap:6px;">${p.marker}<span style="flex:1;">${hovered}</span><b>${v}</b></div>` +
                    `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:4px;font-size:11px;color:#b0bec5;">รวม <b style="color:#fff;">${total}</b>&ensp;(${pct}%)</div>`;
                }
              }
              let txt = `<div style="font-weight:700;margin-bottom:6px;">${name}</div>`;
              let total = 0;
              params.forEach(p => {
                let v = (p.value && p.value[p.seriesName]) || 0;
                total += v;
                if (!v) return;
                txt += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">${p.marker}<span style="flex:1;">${p.seriesName}</span><b>${v}</b></div>`;
              });
              txt += `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:6px;">รวม <b>${total}</b></div>`;
              return txt;
            }
          }),
          dataset: { dimensions: ["tester", ...statusNames], source },
          grid: { left: 16, right: 30, top: 42, bottom: 12, containLabel: true },
          dataZoom: [Object.assign(this.zoomStyle(true), {
            type: "slider", right: 6,
            start: 0, end: testers.length ? Math.min(100, Math.round(10 / testers.length * 100)) : 100,
            width: 10,
            show: testers.length > 10
          }), {
            type: "inside", orient: "vertical", zoomOnMouseWheel: false, moveOnMouseWheel: true
          }],
          xAxis: {
            type: "value",
            axisLine: { show: false }, axisTick: { show: false },
            splitLine: { lineStyle: { color: "#f0f3fa", type: "dashed" } },
            axisLabel: { color: "#a3abbd", fontSize: 11 }
          },
          yAxis: {
            type: "category",
            axisTick: { show: false }, axisLine: { show: false },
            axisLabel: {
              fontSize: 11.5, color: "#5b6479", margin: 12,
              formatter: v => `{n|${v}}  {c|${totalMap[v] || 0}}`,
              rich: {
                n: { color: "#5b6479", fontSize: 11.5 },
                c: {
                  color: "#3d4666", fontSize: 10.5, fontWeight: 700,
                  backgroundColor: "#eef1f8", borderRadius: 5, padding: [2, 6, 2, 6]
                }
              }
            }
          },
          series: statusNames.map((k, i) => ({
            name: k, type: "bar", stack: "tl", barMaxWidth: 18,
            emphasis: { focus: "series" },
            blur: { itemStyle: { opacity: .22 } },
            itemStyle: {
              color: this.barGrad(statusColor[i], true),
              borderColor: "#fff",
              borderWidth: 1.5,
              borderRadius: k === lastSeries ? [0, 7, 7, 0] : (k === statusNames[0] ? [3, 0, 0, 3] : 0)
            },
            encode: { x: k, y: "tester" }
          }))
        };
      },
      donutOption() {
        let statusNames = this.allStatusNames;
        let totals = {};
        this.filteredRows.forEach(r => { totals[r.status_name] = (totals[r.status_name] || 0) + 1; });
        let base = statusNames.map(n => ({ name: n, value: totals[n] || 0 })).filter(d => d.value > 0);
        let total = base.reduce((s, d) => s + d.value, 0);
        let color = base.map(d => this.statusColorOf(d.name));
        let data = base.map(d => {
          let pct = total ? Math.round(d.value / total * 100) : 0;
          let show = pct >= 5;
          return {
            name: d.name,
            value: d.value,
            label: { show, formatter: `{p|${pct}%}` },
            labelLine: { show, length: 10, length2: 10, lineStyle: { color: "#d7dded", width: 1 } }
          };
        });
        return {
          color,
          textStyle: { fontFamily: "'Manrope', 'Sarabun', sans-serif" },
          animationDuration: 850,
          animationEasing: "cubicOut",
          graphic: [
            {
              type: "text",
              left: "center",
              top: "34%",
              silent: true,
              style: {
                text: $xt.formatNumber(total, 0),
                textAlign: "center",
                fill: "#1e2330",
                font: "800 34px 'Manrope', 'Sarabun', sans-serif"
              }
            },
            {
              type: "text",
              left: "center",
              top: "49%",
              silent: true,
              style: {
                text: this.ui.csm_remain_outstanding,
                textAlign: "center",
                fill: "#8a93a6",
                font: "12px 'Manrope', 'Sarabun', sans-serif"
              }
            },
            {
              type: "text",
              left: "center",
              top: "56%",
              silent: true,
              style: {
                text: `${data.length} สถานะ`,
                textAlign: "center",
                fill: "#b6bdcd",
                font: "11px 'Manrope', 'Sarabun', sans-serif"
              }
            }
          ],
          tooltip: Object.assign(this.chartTip(), {
            trigger: "item",
            formatter(p) {
              return `<div style="font-weight:700;margin-bottom:4px;">${p.name}</div>` +
                `${p.marker} <b>${p.value}</b> งาน &nbsp;<span style="color:#b0bec5;">(${p.percent}%)</span>`;
            }
          }),
          legend: {
            type: "scroll", orient: "horizontal", bottom: 2, left: "center",
            icon: "circle", itemWidth: 9, itemHeight: 9, itemGap: 13,
            inactiveColor: "#ccd3e0",
            pageIconColor: "#4f6ef7", pageIconInactiveColor: "#cfd6e4", pageIconSize: 10,
            pageTextStyle: { color: "#8a93a6", fontSize: 11 },
            textStyle: { color: "#5b6479", fontSize: 11, rich: { v: { color: "#1e2330", fontWeight: 700 } } },
            formatter: (name) => `${name} {v|${totals[name] || 0}}`
          },
          series: [{
            type: "pie",
            radius: ["49%", "68%"],
            center: ["50%", "43%"],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: "#fff", borderWidth: 4, borderRadius: 8 },
            label: {
              show: false, position: "outside",
              rich: { p: { color: "#5b6479", fontSize: 11, fontWeight: 700 } }
            },
            labelLine: { show: false, smooth: .2 },
            labelLayout: { hideOverlap: true },
            emphasis: {
              scale: true, scaleSize: 9,
              itemStyle: { shadowBlur: 26, shadowOffsetY: 4, shadowColor: "rgba(31,41,76,.28)" }
            },
            data
          }]
        };
      },
      barChartOption() {
        let statusNames = this.allStatusNames;
        let top = this.groupedList.slice()
          .sort((a, b) => (b.tasktot || 0) - (a.tasktot || 0))
          .slice(0, 15);
        let source = top.map(item => {
          let row = { customer_name: item.customer_name, tasktot: item.tasktot || 0 };
          item.status_name.forEach((s, idx) => { row[s] = item.taskqty[idx] || 0; });
          return row;
        });
        const _pal = ["#4f6ef7","#22d3ee","#a78bfa","#34d399","#fb923c","#f472b6","#60a5fa","#facc15","#4ade80","#818cf8","#f87171","#e879f9"];
        let statusColor = statusNames.map((n, i) => this.statusColorMap[n] || _pal[i % _pal.length]);
        let lastSeries = statusNames[statusNames.length - 1];
        let barSeries = statusNames.map((k, i) => ({
          name: k, type: "bar", stack: "remain", barMaxWidth: 38,
          emphasis: { focus: "series", blurScope: "coordinateSystem" },
          blur: { itemStyle: { opacity: .22 } },
          itemStyle: {
            color: this.barGrad(statusColor[i], false),
            borderColor: "#fff",
            borderWidth: 1.5,
            borderRadius: k === lastSeries ? [7, 7, 0, 0] : (k === statusNames[0] ? [0, 0, 3, 3] : 0)
          },
          encode: { x: "customer_name", y: k }
        }));
        let totalSeries = {
          name: "__total__",
          type: "scatter",
          symbol: "none",
          z: 4,
          data: source.map(r => ({ name: r.customer_name, value: [r.customer_name, r.tasktot] })),
          label: {
            show: true,
            position: "top",
            distance: 9,
            formatter: p => p.value[1] > 0 ? p.value[1] : "",
            color: "#3d4666",
            fontSize: 11,
            fontWeight: "bold",
            backgroundColor: "#fff",
            borderColor: "#e6eaf4",
            borderWidth: 1,
            borderRadius: 7,
            padding: [3, 8],
            shadowBlur: 8,
            shadowColor: "rgba(31,41,76,.10)",
            shadowOffsetY: 2
          },
          tooltip: { show: false }
        };
        return {
          color: statusColor,
          textStyle: { fontFamily: "'Manrope', 'Sarabun', sans-serif" },
          animationDuration: 700,
          animationEasing: "cubicOut",
          animationDelay: idx => idx * 14,
          legend: {
            top: 4, right: 6, type: "scroll",
            icon: "circle", itemWidth: 9, itemHeight: 9, itemGap: 14,
            inactiveColor: "#ccd3e0",
            pageIconColor: "#4f6ef7", pageIconInactiveColor: "#cfd6e4", pageIconSize: 10,
            pageTextStyle: { color: "#8a93a6", fontSize: 11 },
            textStyle: { color: "#5b6479", fontSize: 11.5 }, data: statusNames
          },
          tooltip: Object.assign(this.chartTip(), {
            trigger: "axis",
            axisPointer: { type: "shadow", shadowStyle: { color: "rgba(79,110,247,.06)" } },
            formatter: (params) => {
              let rows = params.filter(p => p.seriesName !== "__total__");
              let name = rows[0] ? rows[0].axisValue : "";
              let hovered = this._barHoveredSeries;
              if (hovered) {
                let p = rows.find(p => p.seriesName === hovered);
                if (p) {
                  let v = (p.value && p.value[p.seriesName]) || 0;
                  let total = (p.value && p.value.tasktot) || 0;
                  let pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return `<div style="font-weight:700;margin-bottom:6px;">${name}</div>` +
                    `<div style="display:flex;align-items:center;gap:6px;">${p.marker}<span style="flex:1;">${hovered}</span><b>${v}</b></div>` +
                    `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:4px;font-size:11px;color:#b0bec5;">รวมคงค้าง <b style="color:#fff;">${total}</b>&ensp;(${pct}%)</div>`;
                }
              }
              let txt = `<div style="font-weight:700;margin-bottom:6px;">${name}</div>`;
              let total = 0;
              rows.forEach(p => {
                let v = (p.value && p.value[p.seriesName]) || 0;
                total += v;
                if (!v) return;
                txt += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">${p.marker}<span style="flex:1;">${p.seriesName}</span><b>${v}</b></div>`;
              });
              txt += `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:6px;">รวมคงค้าง <b>${total}</b></div>`;
              return txt;
            }
          }),
          dataset: { dimensions: ["customer_name", ...statusNames, "tasktot"], source },
          grid: { left: 12, right: 20, top: 46, bottom: 62, containLabel: true },
          xAxis: {
            type: "category",
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              rotate: 30, interval: 0, fontSize: 11, color: "#5b6479",
              hideOverlap: true, overflow: "truncate", width: 90
            }
          },
          yAxis: {
            type: "value",
            axisLine: { show: false }, axisTick: { show: false },
            splitLine: { lineStyle: { color: "#f0f3fa", type: "dashed" } },
            axisLabel: { color: "#a3abbd", fontSize: 11 }
          },
          dataZoom: [
            Object.assign(this.zoomStyle(false), {
              type: "slider", show: top.length > 8, start: 0,
              end: top.length > 8 ? (8 / top.length) * 100 : 100,
              height: 12, bottom: 14
            }),
            { type: "inside", zoomOnMouseWheel: false, moveOnMouseWheel: false }
          ],
          series: [...barSeries, totalSeries]
        };
      }
    },
    watch: {
      statusDetailList() {
        this.$nextTick(() => this.initTableStatus());
      },
      workerWorkload() {
        this.bindWorkerChart();
      },
      testerTestload() {
        this.bindTesterChart();
      },
      'filter.teamWorkers'(val) {
        if (val && val.length) this.filter.workers = [];
      },
      'filter.teamRequesters'(val) {
        if (val && val.length) this.filter.requesters = [];
      }
    },
   async mounted() {
      page = this.$refs.page;
      page.pageTitle = this.ui.csm_remain_page_title;
      document.title = page.pageTitle;

      this.$refs.modalByCustomer.setSize("modal-xl");
      this.$refs.modalByStatus.setSize("modal-xl");
      this.$refs.modalChat.setSize("modal-xl");
      page.loadingBox.show();
      this.loadChart();
      page.loadingBox.hide();

      await this.loadData_Ai()

      this._barHoveredSeries = null;
      this.$nextTick(() => {
        let bar = this.$refs.chart1 && this.$refs.chart1.inst;
        if (bar) {
          bar.off("click");
          bar.on("click", (params) => {
            let row = this.groupedList.find(g => g.customer_name === params.name);
            if (row) this.clickByCustomer(row, params.seriesName === "__total__" ? "" : params.seriesName);
          });
          bar.off("mouseover").on("mouseover", e => {
            if (e.componentType === "series" && e.seriesName !== "__total__")
              this._barHoveredSeries = e.seriesName;
          });
          bar.off("mouseout").on("mouseout", () => {
            this._barHoveredSeries = null;
          });
        }
        let donut = this.$refs.chart2 && this.$refs.chart2.inst;
        if (donut) {
          donut.off("click");
          donut.on("click", (params) => this.clickByStatus(params.name));
        }
      });

      this.$eventBus.$on('AiChatChunk', (data) => {
        if (this.aiStreamIdx < 0) {
          this.aiStreamIdx = this.chatMessages.length;
          this.chatMessages.push({ role: 'assistant', content: data.chunk || '', streaming: true });
        } else {
          const msg = this.chatMessages[this.aiStreamIdx];
          if (msg) this.chatMessages[this.aiStreamIdx] = { ...msg, content: msg.content + (data.chunk || '') };
        }
        this.$nextTick(() => this.scrollChatToBottom());
      });
      this.$eventBus.$on('AiChatDone', (data) => {
        const tokens = (data.input_tokens != null || data.output_tokens != null)
          ? { input: data.input_tokens, output: data.output_tokens, elapsed: data.elapsed_seconds }
          : null;
        if (this.aiStreamIdx >= 0) {
          const msg = this.chatMessages[this.aiStreamIdx];
          this.chatMessages[this.aiStreamIdx] = { role: 'assistant', content: msg ? msg.content : '', tokens };
        } else {
          this.chatMessages.push({ role: 'assistant', content: '', tokens });
        }
        this.aiStreamIdx = -1;
        this.chatLoading = false;
        this.$nextTick(() => this.scrollChatToBottom());
      });
      this.$eventBus.$on('AiChatError', (data) => {
        if (this.aiStreamIdx >= 0) {
          this.chatMessages[this.aiStreamIdx] = { role: 'assistant', content: '⚠️ ' + (data.error || this.ui.erp_error) };
        } else {
          this.chatMessages.push({ role: 'assistant', content: '⚠️ ' + (data.error || this.ui.erp_error) });
        }
        this.aiStreamIdx = -1;
        this.chatLoading = false;
        this.$nextTick(() => this.scrollChatToBottom());
      });
    },
    beforeUnmount() {
      this.$eventBus.$off('AiChatChunk');
      this.$eventBus.$off('AiChatDone');
      this.$eventBus.$off('AiChatError');
    }
  };
  export default cpn;
</script>
<style scoped>
  @import './CSS/v_csm_remain_by_customer.css';
</style>
