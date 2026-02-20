-- Family table
CREATE TABLE family (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(100) NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Child table
CREATE TABLE child (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       family_id UUID NOT NULL REFERENCES family(id),
                       name VARCHAR(100) NOT NULL,
                       age INTEGER,
                       avatar VARCHAR(50),
                       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Task status enum
CREATE TYPE task_status AS ENUM (
    'ASSIGNED',
    'PENDING_APPROVAL',
    'COMPLETED',
    'REJECTED'
);

-- Task table
CREATE TABLE task (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      family_id UUID NOT NULL REFERENCES family(id),
                      child_id UUID REFERENCES child(id),
                      title VARCHAR(200) NOT NULL,
                      description TEXT,
                      point_value INTEGER NOT NULL DEFAULT 10,
                      status task_status NOT NULL DEFAULT 'ASSIGNED',
                      due_date DATE,
                      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Point transaction ledger (append-only)
CREATE TABLE point_transaction (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   child_id UUID NOT NULL REFERENCES child(id),
                                   amount INTEGER NOT NULL,
                                   reason VARCHAR(200),
                                   task_id UUID REFERENCES task(id),
                                   created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reward table
CREATE TABLE reward (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        family_id UUID NOT NULL REFERENCES family(id),
                        name VARCHAR(200) NOT NULL,
                        description TEXT,
                        point_cost INTEGER NOT NULL,
                        active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
