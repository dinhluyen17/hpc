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

import { useI18n } from 'vue-i18n'
import { reactive, ref, SetupContext } from 'vue'
import { useUserStore } from '@/store/user/user'
import { useRoute } from 'vue-router'
import type { FormRules } from 'naive-ui'
import { createCircuit, updateCircuit } from '@/service/modules/circuits'

export function useForm(
  props: any,
  ctx: SetupContext<('cancelModal' | 'confirmModal')[]>
) {
  const { t } = useI18n()
  const userStore = useUserStore()
  const route = useRoute()

  let projectCode = ''
  if (typeof route.params.projectCode === 'string') {
    projectCode = route.params.projectCode
  }

  const resetForm = () => {
    variables.model = {
      id: null,
      name: '',
      description: '',
      json: '',
      qasm: '',
      qiskit: '',
      projectCode: parseInt(projectCode)
    }
  }

  const variables = reactive({
    circuitFormRef: ref(),
    model: {
      id: null,
      name: '',
      description: '',
      json: '',
      qasm: '',
      qiskit: '',
      projectCode: parseInt(projectCode)
    },
    saving: false,
    rules: {
      name: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.name === '') {
            return new Error(t('circuit.circuit_name_tips'))
          }
        }
      }
    } as FormRules
  })

  const handleValidate = (statusRef: number) => {
    variables.circuitFormRef.validate((errors: any) => {
      if (!errors) {
        if (statusRef === 0) {
          submitProjectModal()
        } else if (statusRef === 1) {
          updateProjectModal()
        } else {
          duplicateProjectModal()
        }
      } else {
        return
      }
    })
  }

  const submitProjectModal = async () => {
    if (variables.saving) return
    variables.saving = true
    try {
      await createCircuit(variables.model)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  const updateProjectModal = async () => {
    if (variables.saving) return
    variables.saving = true
    try {
      await updateCircuit(variables.model, props.row.id)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  const duplicateProjectModal = async () => {
    if (variables.saving) return
    variables.saving = true
    try {
      await createCircuit(variables.model)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  return { variables, t, handleValidate }
}
