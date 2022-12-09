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

package org.apache.dolphinscheduler.quantum.service;

import org.apache.dolphinscheduler.api.utils.Result;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * circuit service
 */
public interface CircuitService {

    Map<String, Object> create(Integer userId, String name, String description, String json, String qasm, String qiskit, Integer projectCode);

    Map<String, Object> get(Integer id);

    Result search(Integer userId, String keyword, String criteria, String direction, Integer pageNo, Integer pageSize);

    Map<String, Object> update(int id, String name, String description, String json, String qasm, String qiskit, Integer projectCode) throws IOException;

    Map<String, Object> delete(List<Integer> ids) throws IOException;
}
