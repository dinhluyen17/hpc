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

import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import { queryCircuitListPaging } from '@/service/modules/circuits'
import { parseTime } from '@/common/common'
import { deleteProject } from '@/service/modules/projects'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import {
  NButton,
  NEllipsis,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip
} from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import type { CircuitRes } from '@/service/modules/circuits/types'
import { DeleteOutlined, EditOutlined } from '@vicons/antd'
import { getCircuit } from '@/service/modules/circuits'

export function useTable() {
  const { t } = useI18n()
  const router: Router = useRouter()

  const variables = reactive({
    data: [],
    loadingRef: ref(false)
  })

  const getData = (params: any) => {
    if (variables.loadingRef) return
    variables.loadingRef = true
    const { state } = useAsyncState(
      getCircuit(params).then((res: any) => {
        variables.data = res as CircuitList
        variables.loadingRef = false
      }),
      {}
    )
    return state
  }

  return {
    variables,
    getData
  }
}
