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
import { defineComponent, onMounted, toRefs, ref, watch, getCurrentInstance } from 'vue'
import Card from '@/components/card'
import { useCircuit } from './use-circuit'
import { NButton, NGradientText, NIcon, NInput, NSpace } from 'naive-ui'
import { RollbackOutlined } from '@vicons/antd'
import MESSAGE, { QUANTUM_MESSAGE_FROM, VUEJS_MESSAGE_FROM } from './constants'
import exportFile from '@/utils/exportFile'
import './styles/CircuitStyle.scss'
import HelpModal from './help-modal'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    let quantumRef: any = ref(null);
    let importFileRef: any = ref(null);
    let isIFrameReady: any = ref(false);

    const { t } = useI18n()
    const { variables, getCircuitData, updateCircuitData } = useCircuit()
    const route = useRoute()
    const router: Router = useRouter()

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    const handleShowHelpModal = () => {
      variables.showHelpModalRef = true
    }

    const handleConfirmModal = () => {
      variables.showHelpModalRef = false
    }

    const sendMessageToIFrame = (actionType: string, detailData: string | null) => {
      if (isIFrameReady.value) {
        quantumRef.value.contentWindow.postMessage(JSON.stringify({
          messageFrom: VUEJS_MESSAGE_FROM,
          actionType,
          detailData
        }));
      }
    }

    const handleSelectFile = () => {
      if (importFileRef.value) {
        importFileRef.value.click();                
      }
    }

    const handleImportFileJson = (event: Event) => {      
      const files = event?.target?.files;
      if (files && files.length > 0) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          try {
            const jsonString = fileReader.result;
            if (jsonString && typeof jsonString == "string") {
              const json = JSON.parse(jsonString);
              if (json.cols && json.cols.constructor == Array) {
                sendMessageToIFrame(MESSAGE.setCircuitJson, jsonString);
              }
              else {
                window.$message.error('Please import a valid json file!');
              }
            }
            else {
              window.$message.error('Please import a valid json file!');
            }
          } catch (e) {
            window.$message.error('Please import a valid json file!');
          }
        }
        fileReader.readAsText(files[0]);
      }
      importFileRef.value.value = '';
    }

    const handleExportCircuit = () => {
      variables.isSaveCircuit = false;
      sendMessageToIFrame(MESSAGE.getCircuitJson, null);
    }

    const handleSaveCircuit = () => {
      variables.isSaveCircuit = true;
      sendMessageToIFrame(MESSAGE.getCircuitJson, null);
    }

    const handleChangeTabCircuit = (e: any) => {
      sendMessageToIFrame(MESSAGE.changeTab, 'circuit');
      variables.isCircuitTab = true
    }

    const handleChangeTabSimulate = (e: any) => {
      sendMessageToIFrame(MESSAGE.changeTab, 'simulate');
      variables.isCircuitTab = false
    }

    const handleChangeCircuitName = () => {
      if (variables.currentValue !== variables.data.name) {
        updateCircuitData(variables.data.id, {
          name: variables.data.name
        })
      }
      variables.isChangeName = false
    }

    const handleChangeName = () => {
      variables.currentValue = variables.data.name
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

    const handleReceiveMessage = (e: any) => {
      if (e.data) {
        try {
          const obj = JSON.parse(e.data);
          if (obj && obj.messageFrom == QUANTUM_MESSAGE_FROM) {
            const actionType = obj.actionType;
            switch (actionType) {
              case MESSAGE.setupFinish:
                isIFrameReady.value = true;
                if (variables.data.json) {
                  sendMessageToIFrame(MESSAGE.loadedCircuitJson, variables.data.json);
                }
                break;
              case MESSAGE.saveCircuitJson:
                if (typeof route.params.circuitId === 'string') {
                  updateCircuitData(parseInt(route.params.circuitId), {
                    json: obj.detailData
                  })
                }
                break;
              case MESSAGE.getCurrentCircuitJson:
                if (variables.isSaveCircuit) {
                  if (typeof route.params.circuitId === 'string') {
                    updateCircuitData(parseInt(route.params.circuitId), {
                      json: obj.detailData
                    })
                  }
                } else {
                  exportFile(obj.detailData, variables.data.name, 'json')
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

    watch(
      () => variables.data,
      () => {
        sendMessageToIFrame(MESSAGE.loadedCircuitJson, variables.data.json);
      }
    );

    return {
      t,
      ...toRefs(variables),
      handleChangeName,
      handleExitChangeName,
      handleChangeCircuitName,
      handleReturnToCircuitList,
      handleChangeTabCircuit,
      handleChangeTabSimulate,
      handleSaveCircuit,
      handleSelectFile,
      handleExportCircuit,
      handleConfirmModal,
      handleShowHelpModal,
      handleImportFileJson,
      quantumRef,
      importFileRef,
      trim
    }
  },
  render() {
    const { t, data, handleImportFileJson } = this;
    return (
      <Card style={{ width: '100%', height: '100%' }}>
        <NSpace justify='space-between' align='center'>
          {/* Name and return area */}
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
              //Project Name
              <NSpace>
                <NInput
                  size='small'
                  allowInput={this.trim}
                  v-model={[this.data.name, 'value']}
                  placeholder={t('circuit.detail.change_name_tips')}
                />
                <NButton size='small' type='primary' onClick={this.handleChangeCircuitName}>
                  {this.currentValue === this.data.name ? t('circuit.detail.exit') : t('circuit.detail.update_circuit_name')}
                </NButton>
              </NSpace> :
              //Project Name Edit
              <NButton text onClick={this.handleChangeName}>
                <NGradientText type="info" style={{ fontSize: '36px', cursor: 'pointer' }}>
                  {data.name}
                </NGradientText>
              </NButton>
            }
          </NSpace>
          {/* Tab change area */}
          <div>
            <NButton size='large' focusable={false} style={{ width: '200px', borderRadius: 0 }} onClick={(e) => this.handleChangeTabCircuit(e)} class={`tab-button ${this.isCircuitTab ? 'active' : ''}`}>
              {t('circuit.detail.circuit')}
            </NButton>            
            <NButton size='large' focusable={false} style={{ width: '200px', marginLeft: '-1px', borderRadius: 0 }} onClick={(e) => this.handleChangeTabSimulate(e)} class={`tab-button ${this.isCircuitTab ? '' : 'active'}`}>
              {t('circuit.detail.simulate')}
            </NButton>
          </div>
          {/* Button area */}
          <NSpace>
            <input ref="importFileRef" type='file' onChange={handleImportFileJson} hidden/>
            <NButton size='small' type='primary' onClick={this.handleSaveCircuit}>
              {t('circuit.detail.save_circuit')}
            </NButton>            
            <NButton size='small' type='warning' onClick={this.handleSelectFile}>
              {t('circuit.detail.import_circuit')}
            </NButton>
            <NButton size='small' type='warning' onClick={this.handleExportCircuit}>
              {t('circuit.detail.export_circuit')}
            </NButton>
            <NButton size='small' type='success'>
              {t('circuit.detail.share_circuit')}
            </NButton>
            <NButton size='small' type='success' onClick={this.handleShowHelpModal}>
              {t('circuit.detail.help_circuit')}
            </NButton>
          </NSpace>
        </NSpace>
        <iframe
          ref="quantumRef"
          src="/quirk.html"
          style={{ width: '100%', height: 'calc(100% - 60px)', marginTop: '10px' }}
          frameborder="0">
        </iframe>
        <HelpModal
          showHelpModalRef={this.showHelpModalRef}
          onConfirmModal={this.handleConfirmModal}
        />
      </Card>
    )
  }
})

export default circuitItem
