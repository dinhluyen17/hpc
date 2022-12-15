ALTER TABLE t_ds_project ADD COLUMN type int;

CREATE TABLE t_ds_circuit (
                              id           serial not null,
                              user_id      integer not null,
                              name         varchar,
                              description  varchar,
                              json         varchar,
                              qasm         varchar,
                              qiskit       varchar,
                              create_time  timestamp,
                              update_time  timestamp,
                              project_code bigint,

                              PRIMARY KEY (id),
                              CONSTRAINT t_ds_circuit_un UNIQUE (id)
);
