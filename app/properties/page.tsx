'use client'

import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { compactCurrency, percent } from '@/lib/format'
import { propertyPerformance } from '@/lib/selectors'
import { usePortfolio } from '@/lib/store'

export default function PropertiesPage() {
  const { state } = usePortfolio()
  const performance = propertyPerformance(state)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            {state.properties.length} properties across your portfolio
          </p>
        </div>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Add property
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {performance.map(({ property, units, occupancyRate, rentRoll, net, openTickets }) => (
          <Card key={property.id} className="overflow-hidden">
            <img
              src={property.image || '/placeholder.svg'}
              alt={property.name}
              className="h-40 w-full object-cover"
            />
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="truncate">{property.name}</span>
                <Badge variant="secondary">{property.kind}</Badge>
              </CardTitle>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {property.street}, {property.city}, {property.state}
                </span>
              </p>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Units</p>
                <p className="text-sm font-medium">{units}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-sm font-medium">{percent(occupancyRate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rent roll</p>
                <p className="text-sm font-medium">{compactCurrency(rentRoll)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net this month</p>
                <p className="text-sm font-medium">{compactCurrency(net)}</p>
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              <span className="text-xs text-muted-foreground">
                {openTickets > 0
                  ? `${openTickets} open ticket${openTickets === 1 ? '' : 's'}`
                  : 'No open tickets'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/properties/${property.id}`}>View</Link>}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
