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

import { reactive, ref } from 'vue'
import { useAsyncState } from '@vueuse/core'
import type { CircuitList } from '@/service/modules/circuits/types'
import { getCircuit, updateCircuit } from '@/service/modules/circuits'

export function useCircuit() {
  const variables = reactive({
    data: {} as CircuitList,
    loadingRef: ref(false),
    isChangeName: ref(false)
  })

  const getCircuitData = (id: number) => {
    if (variables.loadingRef) return
    variables.loadingRef = true
    const { state } = useAsyncState(
      getCircuit(id).then((res: CircuitList) => {
        variables.data = res
        variables.loadingRef = false
      }),
      {}
    )
    return state
  }

  const updateCircuitData = (id: number, updateData: any) => {
    const { state } = useAsyncState(
      updateCircuit(updateData, id),
      {}
    )
    return state
  }

  return {
    variables,
    getCircuitData,
    updateCircuitData
  }
}
