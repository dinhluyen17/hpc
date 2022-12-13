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

import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch
} from 'vue'
import { NForm, NFormItem, NInput } from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import { useUserStore } from '@/store/user/user'
import { useRoute } from 'vue-router'

const props = {
  showModalRef: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  statusRef: {
    type: Number as PropType<number>,
    default: 0
  },
  row: {
    type: Object as PropType<any>,
    default: {}
  }
}

const ProjectModal = defineComponent({
  name: 'ProjectModal',
  props,
  emits: ['cancelModal', 'confirmModal'],
  setup(props, ctx) {
    const { variables, t, handleValidate } = useForm(props, ctx)

    const userStore = useUserStore()

    const route = useRoute()

    let projectCode = ''
    if (typeof route.params.projectCode === 'string') {
      projectCode = route.params.projectCode
    }

    const cancelModal = () => {
      if (props.statusRef === 0) {
        variables.model.name = ''
        variables.model.description = ''
        variables.model.json = ''
        variables.model.qasm = ''
        variables.model.qiskit = ''
      } else {
        variables.model.id = props.row.id
        variables.model.name = props.row.name
        variables.model.description = props.row.description
        variables.model.json = props.row.json
        variables.model.qasm = props.row.qasm
        variables.model.qiskit = props.row.qiskit
        variables.model.projectCode = parseInt(projectCode)
      }
      ctx.emit('cancelModal', props.showModalRef)
    }

    const confirmModal = () => {
      handleValidate(props.statusRef)
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    watch(
      () => props.statusRef,
      () => {
        if (props.statusRef === 0) {
          variables.model.name = ''
          variables.model.description = ''
          variables.model.json = ''
          variables.model.qasm = ''
          variables.model.qiskit = ''
          variables.model.projectCode = parseInt(projectCode)
        } else {
          variables.model.id = props.row.id
          variables.model.name = props.row.name
          variables.model.description = props.row.description
          variables.model.json = props.row.json
          variables.model.qasm = props.row.qasm
          variables.model.qiskit = props.row.qiskit
          variables.model.projectCode = props.row.projectCode
        }
      }
    )

    watch(
      () => props.row,
      () => {
        variables.model.id = props.row.id
        variables.model.name = props.row.name
        variables.model.description = props.row.description
        variables.model.json = props.row.json
        variables.model.qasm = props.row.qasm
        variables.model.qiskit = props.row.qiskit
        variables.model.projectCode = props.row.projectCode
      }
    )

    return { ...toRefs(variables), t, cancelModal, confirmModal, trim }
  },
  render() {
    const { t } = this
    return (
      <Modal
        title={
          this.statusRef === 0
            ? t('circuit.create_circuit')
            : t('circuit.edit_circuit')
        }
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        confirmDisabled={!this.model.name}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm rules={this.rules} ref='circuitFormRef'>
          <NFormItem label={t('circuit.name')} path='name'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.name, 'value']}
              placeholder={t('circuit.circuit_name_tips')}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem label={t('circuit.description')} path='description'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.description, 'value']}
              type='textarea'
              placeholder={t('circuit.circuit_description_tips')}
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
