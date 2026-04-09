import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchAuthQuery } from '@/lib/auth-server';
import { api } from '@convex/_generated/api';
import { Phone, User, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getHandler = async (handlerId: string) => {
    const handler = await fetchAuthQuery(api.workers.getWorkerByUserID, { userId: handlerId });
    return handler;
}

type status = "off-duty" | "on-duty"

const dutyStatusBadge = (status: status) => {
    switch (status) {
        case 'on-duty':
            return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">On Duty</Badge>
        case 'off-duty':
            return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-medium">Off Duty</Badge>
        default:
            return <Badge variant="outline" className="font-medium capitalize">{status}</Badge>
    }   
}

const OrderHandlerCard = async ({handlerId}: {handlerId: string}) => {
    const handler = await getHandler(handlerId);

    if (!handler) return null;

    const { name, status, phone } = handler;

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Handler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <span className="text-sm font-medium leading-none">{name}</span>
          </div>
        </div>

        {phone && (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Phone number</span>
              <span className="text-sm font-medium leading-none">{phone}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Duty Status</span>
            <div className="pt-0.5">
              {dutyStatusBadge(status as status)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderHandlerCard;