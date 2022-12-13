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

import { SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NPagination,
  NPopconfirm,
  NSpace
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useTable } from './use-table'
import Card from '@/components/card'
import ProjectModal from './components/project-modal'
import { massActionDeleteCircuit, massActionExportCircuit } from '@/service/modules/circuits'

const list = defineComponent({
  name: 'list',
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const { variables, getTableData, createColumns } = useTable()

    const handleSorterChange = (sorter: any) => {
      const type = sorter.order === 'ascend' ? 'asc' : 'desc'
      var field = sorter.columnKey
      if (field === 'createTime') {
        field = 'create_time'
      } else if (field === 'updateTime') {
        field = 'update_time'
      }

      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        criteria: field,
        direction: type,
      }, route.params.projectCode)
    }

    const handleRowKeyChange = (rowKey: any) => {
      variables.isShowMassAction = rowKey.length > 0 ? true : false
      variables.massActionElement = rowKey;
    }

    const handleMassActionDelete = () => {
      const query = variables.massActionElement.join(',');
      massActionDeleteCircuit(query).then(() => {
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

    const handleMassActionExport = () => {
      const query = variables.massActionElement.join(',');
      massActionExportCircuit(query)
    }

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        keyword: variables.searchVal
      }, route.params.projectCode)
    }

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onCancelModal = () => {
      variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(() => {
      createColumns(variables)
      requestData()

    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    return {
      t,
      ...toRefs(variables),
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      handleChangePageSize,
      trim,
      handleSorterChange,
      handleRowKeyChange,
      rowKey: (row: any) => row.id,
      handleMassActionDelete,
      handleMassActionExport
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <Card>
          <NSpace justify='space-between'>
            <NButton
              size='small'
              onClick={this.handleModalChange}
              type='primary'
            >
              {t('circuit.list.create_title')}
            </NButton>
            <NSpace>
              <NInput
                allowInput={this.trim}
                size='small'
                v-model={[this.searchVal, 'value']}
                placeholder={t('circuit.list.circuit_tips')}
                clearable
              />
              <NButton size='small' type='primary' onClick={this.handleSearch}>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </NButton>
            </NSpace>
          </NSpace>
        </Card>
        <Card title={t('circuit.list.title')}>
          {this.isShowMassAction &&
            <NSpace>
              <NPopconfirm onPositiveClick={this.handleMassActionDelete}>
                {{
                  default: () => t('project.list.delete_confirm'),
                  trigger: () => (
                    <NButton size='small' type='error' style={{ marginBottom: '12px' }}>
                      {t('circuit.list.delete_circuit')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
              <NButton size='small' type='warning' style={{ marginBottom: '12px' }} onClick={this.handleMassActionExport}>
                {t('circuit.list.export_circuit')}
              </NButton>
            </NSpace>}
          <NSpace vertical>
            <NDataTable
              loading={loadingRef}
              columns={this.columns}
              data={this.tableData}
              scrollX={this.tableWidth}
              row-class-name='items'
              on-update:sorter={this.handleSorterChange}
              rowKey={this.rowKey}
              on-update:checked-row-keys={this.handleRowKeyChange}
            />
            <NSpace justify='center'>
              <NPagination
                v-model:page={this.page}
                v-model:page-size={this.pageSize}
                page-count={this.totalPage}
                show-size-picker
                page-sizes={[10, 30, 50]}
                show-quick-jumper
                onUpdatePage={this.requestData}
                onUpdatePageSize={this.handleChangePageSize}
              />
            </NSpace>
          </NSpace>
        </Card>
        <ProjectModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        />
      </NSpace>
    )
  }
})

export default list
