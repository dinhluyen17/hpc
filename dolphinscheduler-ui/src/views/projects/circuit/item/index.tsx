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
import { useRoute } from 'vue-router'
import { defineComponent, onBeforeUnmount, onMounted, toRefs, ref, watch } from 'vue'
import Card from '@/components/card'
import { useCircuit } from './use-circuit'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    let quantumRef: any = ref(null);
    let isIFrameReady: any = ref(false);

    const { t } = useI18n()
    const { variables, getCircuitData, updateCircuitData } = useCircuit()
    const route = useRoute()

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
      quantumRef
    }
  },
  render() {
    const { t, data } = this;
    return (
      <Card style={{ width: '100%', height: '100%' }}>
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
