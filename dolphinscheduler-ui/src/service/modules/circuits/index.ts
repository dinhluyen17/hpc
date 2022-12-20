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

import { axios } from '@/service/service'
import { ListReq, CircuitReq } from './types'

export function getCircuit(id: number): any {
  return axios({
    url: `/circuit/get?id=${id}`,
    method: 'get'
  })
}

export function queryCircuitListPaging(params: ListReq): any {
  return axios({
    url: '/circuit/search',
    method: 'get',
    params
  })
}

export function createCircuit(data: CircuitReq): any {
  return axios({
    url: '/circuit/create',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    data: JSON.stringify(data)
  })
}

export function updateCircuit(data: CircuitReq, id: number): any {
  return axios({
    url: `/circuit/update?id=${id}`,
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    method: 'patch',
    data: JSON.stringify(data)
  })
}

export function deleteCircuit(id: number): any {
  return axios({
    url: `/circuit/delete?id=${id}`,
    method: 'delete'
  })
}

export function massActionDeleteCircuit(ids: string): any {
  return axios({
    url: `/circuit/delete?id=${ids}`,
    method: 'delete'
  })
}
