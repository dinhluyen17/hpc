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
import { Router, useRoute, useRouter } from 'vue-router'
import { defineComponent, onBeforeUnmount, onMounted, toRefs, ref, watch, getCurrentInstance } from 'vue'
import Card from '@/components/card'
import { useCircuit } from './use-circuit'
import { NButton, NGradientText, NIcon, NInput, NSpace} from 'naive-ui'
import { RollbackOutlined } from '@vicons/antd'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    let quantumRef: any = ref(null);
    let isIFrameReady: any = ref(false);

    const { t } = useI18n()
    const { variables, getCircuitData, updateCircuitData } = useCircuit()
    const route = useRoute()
    const router: Router = useRouter()

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    const handleChangeCircuitName = () => {
      updateCircuitData(variables.data.id, {
        name: variables.data.name
      })
      variables.isChangeName = false
    }

    const handleChangeName = () => {
      variables.isChangeName = true
    }

    const handleExitChangeName = () => {
      variables.isChangeName = false
    }

    const handleReturnToCircuitList = () => {
      router.push({
        name: 'projects-circuit',
        params: {
          projectType: route.params.projectType,
          projectCode: route.params.projectCode
        }
      })
    }

    const sendMessageToIFrame = (actionType: string, detailData: string) => {
      if (isIFrameReady.value) {
        quantumRef.value.contentWindow.postMessage(JSON.stringify({
          messageFrom: 'vuejs',
          actionType,
          detailData
        }));
      }
    }

    const handleReceiveMessage = (e: any) => {
      if (e.data) {
        try {
          const obj = JSON.parse(e.data);
          if (obj && obj.messageFrom == 'quantum_composer') {
            const actionType = obj.actionType;
            switch (actionType) {
              case 'setup_finish':
                isIFrameReady.value = true;
                if (variables.data.json) {
                  sendMessageToIFrame('loaded_circuit_json', variables.data.json);
                }
                break;
              case 'save_circuit_json':
                if (typeof route.params.circuitId === 'string') {
                  updateCircuitData(parseInt(route.params.circuitId), {
                    json: obj.detailData
                  })
                }
                break;
            }
          }
        } catch (ex) {
        }
      }
    }

    const requestData = () => {
      if (typeof route.params.circuitId === 'string') {
        getCircuitData(parseInt(route.params.circuitId))
      }
    }

    onMounted(() => {
      requestData()
      window.addEventListener('message', handleReceiveMessage)
    })

    onBeforeUnmount(() => {
      window.addEventListener('message', handleReceiveMessage)
    })

    watch(
      () => variables.data,
      () => {
        sendMessageToIFrame('loaded_circuit_json', variables.data.json);
      }
    );

    return {
      t,
      ...toRefs(variables),
      handleChangeName,
      handleExitChangeName,
      handleChangeCircuitName,
      handleReturnToCircuitList,
      quantumRef,
      trim
    }
  },
  render() {
    const { t, data } = this;
    return (
      <Card style={{ width: '100%', height: '100%' }}>
        {/* <NSpace justify='space-between' align='center'>
          <NSpace justify='space-between' align='center'>
            <NButton size='small' type='primary' onClick={this.handleReturnToCircuitList}>
              {{
                icon: () => <NIcon size='16'>
                  <RollbackOutlined />
                </NIcon>,
                default: t('circuit.detail.return')
              }}
            </NButton>
            {this.isChangeName ?
              <NSpace>
                <NInput
                  size='small'
                  allowInput={this.trim}
                  v-model={[this.data.name, 'value']}
                  placeholder={t('circuit.detail.change_name_tips')}
                  clearable
                />
                <NButton size='small' type='primary' onClick={this.handleChangeCircuitName}>
                  {t('circuit.detail.update_circuit_name')}
                </NButton>
              </NSpace> :
              <NButton text onClick={this.handleChangeName}>
                <NGradientText type="info" style={{ fontSize: '36px', cursor: 'pointer' }}>
                  {data.name}
                </NGradientText>
              </NButton>
            }
          </NSpace>
          <NSpace>
            <NButton size='small' type='primary'>
              {t('circuit.detail.save_circuit')}
            </NButton>
            <NButton size='small' type='warning'>
              {t('circuit.detail.import_circuit')}
            </NButton>
            <NButton size='small' type='warning'>
              {t('circuit.detail.export_circuit')}
            </NButton>
            <NButton size='small' type='success'>
              {t('circuit.detail.share_circuit')}
            </NButton>
            <NButton size='small' type='success'>
              {t('circuit.detail.help_circuit')}
            </NButton>
          </NSpace>
        </NSpace> */}
        <iframe
          ref="quantumRef"
          src="/quirk.html"
          style={{ width: '100%', height: '100%' }}
          frameborder="0">
        </iframe>
      </Card>
    )
  }
})

export default circuitItem
