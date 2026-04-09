import { fetchAuthQuery } from '@/lib/auth-server';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const OrderDetailsClient = async ({clientId}: {clientId: Id<"clients">}) => {    
  const client = await fetchAuthQuery(api.clients.getClientById, { id: clientId });
  if(!client) return null;

  const {name, email, phone, address} = client;

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Client </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <span className="text-sm font-medium leading-none">{name}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Email address</span>
            <span className="text-sm font-medium leading-none">{email}</span>
          </div>
        </div>

        {phone && (
          <div className="flex items-start gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Phone number</span>
              <span className="text-sm font-medium leading-none">{phone}</span>
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Address</span>
              <span className="text-sm font-medium leading-normal">{address}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsClient;
