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

import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { ref } from 'vue'
import Card from '@/components/card'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    let quantumRef = ref(null);

    const sendMessageToIFrame = () => {
      //quantumRef.value.contentWindow.postMessage('message', '*');
    }

    // Handle message from Iframe
    const handleReceiveMessage = () => {
    }

    onMounted(() => {
      window.addEventListener('message', handleReceiveMessage)
    })

    onBeforeUnmount(() => {
      window.addEventListener('message', handleReceiveMessage)
    })

    return {
      quantumRef
    }
  },
  render() {
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
