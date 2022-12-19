/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import { deleteCircuit, queryCircuitListPaging } from '@/service/modules/circuits'
import { parseTime } from '@/common/common'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import {
  NButton,
  NEllipsis,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip
} from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import type { CircuitList, CircuitRes } from '@/service/modules/circuits/types'
import { DeleteOutlined, EditOutlined, CopyOutlined, ExportOutlined } from '@vicons/antd'
import exportFile from '@/utils/exportFile'

export function useTable() {
  const { t } = useI18n()
  const router: Router = useRouter()

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
  }

  const handleDuplicate = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 2
    variables.row = row
  }

  const handleDelete = (row: any) => {
    deleteCircuit(row.id).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        searchVal: variables.searchVal
      }, null)
    })
  }

  const handleExportCircuit = (row: any) => {
    exportFile(row.json, row.name, 'json')
  }

  const createColumns = (variables: any) => {
    variables.columns = [
      {
        type: 'selection'
      },
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      {
        title: t('circuit.list.circuit_name'),
        key: 'name',
        ...COLUMN_WIDTH_CONFIG['linkName'],
        sorter: 'default',
        render: (row: { id: string; name: any }) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                router.push({
                  name: 'projects-circuit-item',
                  params: { circuitId: row.id }
                })
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.name
                )
            }
          )
      },
      {
        title: t('circuit.list.circuit_description'),
        key: 'description',
        ...COLUMN_WIDTH_CONFIG['note']
      },
      {
        title: t('project.list.create_time'),
        key: 'createTime',
        ...COLUMN_WIDTH_CONFIG['time'],
        sorter: 'default'
      },
      {
        title: t('project.list.update_time'),
        key: 'updateTime',
        ...COLUMN_WIDTH_CONFIG['time'],
        sorter: 'default'
      },
      {
        title: t('project.list.operation'),
        key: 'actions',
        ...COLUMN_WIDTH_CONFIG['operation'](4),
        render(row: any) {
          return h(NSpace, null, {
            default: () => [
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'info',
                        size: 'small',
                        onClick: () => {
                          handleEdit(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(EditOutlined) })
                      }
                    ),
                  default: () => t('circuit.list.edit_circuit')
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    handleDelete(row)
                  }
                },
                {
                  trigger: () =>
                    h(
                      NTooltip,
                      {},
                      {
                        trigger: () =>
                          h(
                            NButton,
                            {
                              circle: true,
                              type: 'error',
                              size: 'small'
                            },
                            {
                              icon: () =>
                                h(NIcon, null, {
                                  default: () => h(DeleteOutlined)
                                })
                            }
                          ),
                        default: () => t('circuit.list.delete_circuit')
                      }
                    ),
                  default: () => t('circuit.list.delete_confirm')
                }
              ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'warning',
                        size: 'small',
                        onClick: () => {
                          handleDuplicate(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(CopyOutlined) })
                      }
                    ),
                  default: () => t('circuit.list.duplicate_circuit')
                }
              ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'success',
                        size: 'small',
                        onClick: () => {
                          handleExportCircuit(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, {
                            default: () => h(ExportOutlined)
                          })
                      }
                    ),
                  default: () => t('circuit.list.export_circuit')
                }
              )
            ]
          })
        }
      }
    ]
    if (variables.tableWidth) {
      variables.tableWidth = calculateTableWidth(variables.columns)
    }
  }

  const variables = reactive({
    columns: [],
    tableWidth: DefaultTableWidth,
    tableData: [],
    page: ref(1),
    pageSize: ref(10),
    searchVal: ref(null),
    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    loadingRef: ref(false),
    isShowMassAction: ref(false),
    massActionElement: []
  })

  const getTableData = (params: any, projectCode: string | string[] | null) => {
    if (variables.loadingRef) return
    variables.loadingRef = true
    const { state } = useAsyncState(
      queryCircuitListPaging(params).then((res: CircuitRes) => {
        variables.totalPage = res.totalPage
        variables.tableData = res.totalList.map((item, unused) => {
          item.createTime = format(
            parseTime(item.createTime),
            'yyyy-MM-dd HH:mm:ss'
          )
          item.updateTime = format(
            parseTime(item.updateTime),
            'yyyy-MM-dd HH:mm:ss'
          )
          return {
            ...item
          }
        }) as any
        if (projectCode !== null) {
          variables.tableData = variables.tableData.filter((circuit: CircuitList) => {
            if (typeof projectCode === 'string') {
              return circuit.projectCode === parseInt(projectCode)
            }
          }) as any
        }
        variables.loadingRef = false
      }),
      {}
    )
    return state
  }

  return {
    variables,
    getTableData,
    createColumns
  }
}
