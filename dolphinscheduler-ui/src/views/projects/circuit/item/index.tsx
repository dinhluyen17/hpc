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
import { useRoute, useRouter } from 'vue-router'
import { NSelect, NSpace, NSwitch } from 'naive-ui'
import { defineComponent, onBeforeUnmount } from 'vue'
import { h, reactive, ref } from 'vue'
import Card from '@/components/card'
import type { CircuitList } from '@/service/modules/circuits/types'
import { useTable } from './use-table'
import { onBeforeMount, onMounted, onUnmounted, toRefs, watch } from 'vue'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    let quantumRef = ref(null);
    const { t } = useI18n()
    const { variables, getData} = useTable()
    const route = useRoute()
    const id = route.params.circuitId

    const sendMessageToIFrame = () => {
      // 
      //quantumRef.value.contentWindow.postMessage('message', '*');
    }
    // Handle message from Iframe
    const handleReceiveMessage = () => {
    }
    const requestData = () => {
      getData({
        id: id
      })
    }
    onBeforeMount(() => {
      requestData()
    })

    onMounted(() => {
      window.addEventListener('message', handleReceiveMessage)
    })
    onBeforeUnmount(() => {
      window.addEventListener('message', handleReceiveMessage)
    })
    return {
      variables,
      ...toRefs(variables),
      quantumRef
    }
  },
  render() {
    const { variables } = this;
    return (
      <Card style={{ width: '100%', height: '100%' }}>
        <iframe
          ref="quantumRef"
          src="/quirk.html"
          style={{ width: '100%', height: '100%' }}
          frameborder="0" >
        </iframe>
      </Card>
    )
  }
})

export default circuitItem
