/* eslint-disable */
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
import { defineComponent, onMounted, onBeforeUnmount, toRefs, ref, watch, getCurrentInstance } from 'vue'
import Card from '@/components/card'
import { useCircuit } from './use-circuit'
import { NButton, NGradientText, NIcon, NInput, NSpace } from 'naive-ui'
import { RollbackOutlined } from '@vicons/antd'
import MESSAGE, { QUANTUM_MESSAGE_FROM, VUEJS_MESSAGE_FROM } from './constants'
import exportFile from '@/utils/exportFile'
import './styles/CircuitStyle.scss'
import HelpModal from './help-modal'
import {deleteHistory, stateBarCalc} from "@/service/modules/circuits";
import { CircuitBarData } from "@/service/modules/circuits/types";
import { exportQasm, importQasmTxtFile } from '@/service/modules/circuits'

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

    const sendMessageToIFrame = (actionType: string, detailData: string | number | null) => {
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
            if (jsonString && jsonString.includes("OPENQASM")) {
              importQasmTxtFile(jsonString)
                .then(response => {
                  sendMessageToIFrame(MESSAGE.setCircuitQasm, JSON.stringify(response.data));
                })
                .catch((error) =>
                  window.$message.error('Please import a valid qasm text file!')
                )
            }
            else if (jsonString && typeof jsonString == "string") {
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

    const handleExportCircuit = (e: Event) => {
      const value = (e.target as HTMLSelectElement).value;
      //export qasm code
      if (value == 'json') {
        variables.isSaveCircuit = false
        sendMessageToIFrame(MESSAGE.getCircuitJson, null)
      } else if (value == 'qasm') {
        //call api to export qasm code
        exportQasm(variables.data.id).then((res: any) => {
          exportFile(res, variables.data.name, 'qasm')
        })
      }
      if (document.getElementById("download-option") !== null) {
        document.getElementById("download-option").selectedIndex = 0; //first option
      }
      return
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
                if (variables.data.name) {
                  sendMessageToIFrame(MESSAGE.sendName, parseInt(route.params.circuitId as string));
                }
                break;
              case MESSAGE.saveCircuitJson:
                if (typeof route.params.circuitId === 'string') {
                  updateCircuitData(parseInt(route.params.circuitId), {
                    json: obj.detailData
                  });
                }
                break;
              case MESSAGE.getCurrentCircuitJson:
                if (variables.isSaveCircuit) {
                  if (typeof route.params.circuitId === 'string') {
                    deleteHistory(parseInt(route.params.circuitId));
                    updateCircuitData(parseInt(route.params.circuitId), {
                      json: obj.detailData.json,
                      qasm: obj.detailData.qasm,
                      qiskit: obj.detailData.qiskit
                    })
                  }
                } else {
                  exportFile(obj.detailData.json, variables.data.name, 'json')
                }
                break;
              case MESSAGE.getCurrentCircuitData:
                if (JSON.parse(obj.detailData).qProb[0] !== 'NaN') {
                  stateBarCalc(JSON.parse(obj.detailData).qStates, JSON.parse(obj.detailData).qProb)
                    .then((res) => {
                      sendMessageToIFrame(MESSAGE.sendData, res)
                    })
                }
                break;
              case MESSAGE.getQasmErrorMessage:
                window.$message.error(obj.detailData, {
                  closable: true,
                  duration: 10e3
                });
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
      window.removeEventListener('message', handleReceiveMessage)
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
            <button style={{ borderRadius: '5px 0 0 5px' }} onClick={(e) => this.handleChangeTabCircuit(e)} class={`tab-button ${this.isCircuitTab ? 'active' : ''}`}>
              {t('circuit.detail.circuit')}
            </button>
            <button style={{ borderRadius: '0 5px 5px 0' }} onClick={(e) => this.handleChangeTabSimulate(e)} class={`tab-button ${this.isCircuitTab ? '' : 'active'}`}>
              {t('circuit.detail.simulate')}
            </button>
          </div>
          {/* Button area */}
          <NSpace>
            <input ref="importFileRef" type='file' accept=".json" onChange={handleImportFileJson} hidden />
            <NButton size='small' type='primary' onClick={this.handleSaveCircuit}>
              {t('circuit.detail.save_circuit')}
            </NButton>
            <NButton size='small' type='warning' onClick={this.handleSelectFile}>
              {t('circuit.detail.import_circuit')}
            </NButton>
            {/* <NButton id='parent-download' size='small' type='warning' onClick={this.handleDownLoadOptions}>
              {t('circuit.detail.export_circuit')}
            </NButton> */}
            <div class="n-button n-button--warning-type n-button--small-type" id='download'>
              <select class="n-button n-button--warning-type n-button--small-type" id="download-option" onChange={(e) => this.handleExportCircuit(e)}>
                <option class="n-button__content" value={'none'}>{t('circuit.detail.export_circuit')}</option>
                <option class="n-button__content" value={'json'}>JSON</option>
                <option class="n-button__content" value={'qasm'}>QASM 2.0</option>
              </select>
            </div>

            {/* <NButton size='small' type='success'>
              {t('circuit.detail.share_circuit')}
            </NButton> */}
            <NButton size='small' type='success' onClick={this.handleShowHelpModal}>
              {t('circuit.detail.help_circuit')}
            </NButton>
          </NSpace>
        </NSpace>
        <iframe
          ref="quantumRef"
          src={process.env.NODE_ENV === 'production' ? "/dolphinscheduler/ui/quirk.html" : "/quirk.html"}
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
