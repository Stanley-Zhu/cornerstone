'use client'

import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { currency } from '@/lib/format'
import { usePortfolio } from '@/lib/store'
import { CURRENT_PERIOD } from '@/lib/mock-data'

const METHODS = ['ACH', 'Card', 'Check', 'Cash'] as const

export function RecordPaymentDialog({
  leaseId,
  tenantName,
  unitLabel,
  balance,
  period = CURRENT_PERIOD,
  trigger,
}: {
  leaseId: string
  tenantName: string
  unitLabel: string
  balance: number
  period?: string
  trigger: ReactNode
}) {
  const { recordPayment } = usePortfolio()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(balance))
  const [method, setMethod] = useState<(typeof METHODS)[number]>('ACH')

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setAmount(String(balance))
      setMethod('ACH')
    }
  }

  function handleSubmit() {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a payment amount greater than zero.')
      return
    }
    recordPayment({ leaseId, period, amount: value, method })
    toast.success(`${currency(value)} recorded for ${tenantName}.`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {tenantName} — {unitLabel}. Outstanding balance {currency(balance)}.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payment-amount">Amount received</FieldLabel>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="25"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <FieldDescription>
              Partial payments are allowed and reduce the remaining balance.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-method">Method</FieldLabel>
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as (typeof METHODS)[number])}
            >
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {METHODS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
