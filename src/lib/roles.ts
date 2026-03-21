import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";


const statements = {
    users:["create", "read", "update", "delete"],
    stores:["create", "read", "update", "delete"],
    orders:["create", "read", "update", "delete"],
    deliveries:["create", "read", "update", "delete"],
    clients:["create", "read", "update", "delete"],
    courriers:["create", "read", "update", "delete"],
    notifications:["create", "read", "update", "delete"],
    invoices: ["create", "read", "update", "delete"],
    transactions: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statements);


export const admin = accessControl.newRole({
    ...defaultStatements, 
    users:["create", "read", "update", "delete"],
    stores:["create", "read", "update", "delete"],
    orders:["create", "read", "update", "delete"],
    deliveries:["create", "read", "update", "delete"],
    clients:["create", "read", "update", "delete"],
    courriers:["create", "read", "update", "delete"],
    notifications:["create", "read", "update", "delete"],
    invoices: ["create", "read", "update", "delete"],
    transactions: ["create", "read", "update", "delete"],
});

export const worker = accessControl.newRole({
    users:["read"],
    orders:["read", "update", "create"],
    deliveries:["read", "update", "create"],
    clients:["read"],
    courriers:["read", "create"],
    notifications:["create", "read", "update", "delete"],
    invoices: ["create", "read", "update"],
    transactions: ["create", "read", "update"],
});

export const client = accessControl.newRole({
users:["read", "update"],
stores:["read"],
orders:["read", "update", "create"],
deliveries:["read", "update", "create"],
clients:["read", "update"],
courriers:["read"],
notifications:["read", "update", "delete"],
invoices: ["read", "update"],
transactions: ["read", "update"],
})

export const courier = accessControl.newRole({
    users:["read", "update"],
    orders:["read", "update"],
    deliveries:["read", "update"],
    clients:["read"],
    courriers:["read", "update"],
    notifications:["read", "update", "delete"],
});

export const roles = {
    admin,
    worker,
    client,
    courier,
} as const;