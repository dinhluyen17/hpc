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
import { defineComponent } from 'vue'
import { h, reactive, ref } from 'vue'
import Card from '@/components/card'
import type { CircuitList } from '@/service/modules/circuits/types'
import { useTable } from './use-table'
import { onBeforeMount, onMounted, onUnmounted, toRefs, watch } from 'vue'

const circuitItem = defineComponent({
  name: 'circuitItem',
  setup() {
    const { t } = useI18n()
    const { variables, getData} = useTable()
    const route = useRoute()
    const id = route.params.circuitId
    const requestData = () => {
      getData({
        id: id
      })
    }

    onBeforeMount(() => {
      requestData()
    })

    return {
      variables,
      ...toRefs(variables)
    }
  },
  render() {
    const { variables } = this
    const circuit = variables?.data ? ("https://algassert.com/quirk#circuit="+encodeURIComponent(variables.data.json)) : ''
    return (
      <Card style={{ marginLeft: '10%', width: '70%' }} title={variables.data ? variables.data.name : 'Empty'}>
        <iframe width="1200" height="600" src={circuit}></iframe>
      </Card>
    )
  }
})

export default circuitItem
