import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  toRefs,
  watch
} from 'vue'
import {
  NButton,
  NInput,
  NIcon,
  NDataTable,
  NPagination,
  NSpace
} from 'naive-ui'
import { SearchOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import { useColumns } from './use-columns'
import { useTable } from './use-table'
import { DefaultTableWidth } from '@/common/column-width-config'
import Card from '@/components/card'
import DetailModal from './detail'
import type { TableColumns } from './types'
import SourceModal from './source-modal'

const list = defineComponent({
  name: 'list',
  setup() {
    const { t } = useI18n()
    const showDetailModal = ref(false)
    const showSourceModal = ref(false)
    const selectType = ref('MYSQL')
    const selectId = ref()
    const columns = ref({
      columns: [] as TableColumns,
      tableWidth: DefaultTableWidth
    })
    const { data, changePage, changePageSize, deleteRecord, updateList } =
      useTable()

    const { getColumns } = useColumns((id: number, type: 'edit' | 'delete') => {
      if (type === 'edit') {
        showDetailModal.value = true
        selectId.value = id
      } else {
        deleteRecord(id)
      }
    })

    const onCreate = () => {
      selectId.value = null
      showSourceModal.value = true
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    const handleSelectSourceType = (value: string) => {
      selectType.value = value
      showSourceModal.value = false
      showDetailModal.value = true
    }

    const handleSourceModalOpen = () => {
      showSourceModal.value = true
    }

    onMounted(() => {
      changePage(1)
      columns.value = getColumns()
    })

    watch(useI18n().locale, () => {
      columns.value = getColumns()
    })

    return {
      t,
      showDetailModal,
      showSourceModal,
      id: selectId,
      columns,
      ...toRefs(data),
      changePage,
      changePageSize,
      onCreate,
      onUpdatedList: updateList,
      trim,
      handleSelectSourceType,
      selectType,
      handleSourceModalOpen
    }
  },
  render() {
    const {
      t,
      id,
      showDetailModal,
      showSourceModal,
      columns,
      list,
      page,
      pageSize,
      itemCount,
      loading,
      changePage,
      changePageSize,
      onCreate,
      onUpdatedList,
      handleSelectSourceType,
      selectType,
      handleSourceModalOpen
    } = this

    return (
      <NSpace vertical>
        {/* <Card title={t('menu.datasource')}> */}
        <Card title='Project List'>
          <NSpace vertical>
            <NDataTable
              row-class-name='data-source-items'
              columns={columns.columns}
              data={list}
              loading={loading}
              striped
              scrollX={columns.tableWidth}
            />
            <NSpace justify='center'>
              <NPagination
                page={page}
                page-size={pageSize}
                item-count={itemCount}
                show-quick-jumper
                show-size-picker
                page-sizes={[10, 30, 50]}
                on-update:page={changePage}
                on-update:page-size={changePageSize}
              />
            </NSpace>
          </NSpace>
        </Card>
        <SourceModal show={showSourceModal} onChange={handleSelectSourceType}></SourceModal>
        <DetailModal
          show={showDetailModal}
          id={id}
          selectType={selectType}
          onCancel={() => void (this.showDetailModal = false)}
          onUpdate={onUpdatedList}
          onOpen={handleSourceModalOpen}
        />
      </NSpace>
    )
  }
})
export default list
