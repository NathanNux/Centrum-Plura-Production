'use client'
import { getPipelines } from '@/lib/queries'
import { Prisma } from '@prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card'
import { Progress } from '../ui/progress'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'

type Props = {
  subaccountId: string
}

const PipelineValue = ({ subaccountId }: Props) => {
  const [pipelines, setPipelines] = useState<
    Prisma.PromiseReturnType<typeof getPipelines>
  >([])

  const [selectedPipelineId, setselectedPipelineId] = useState('')
  const [pipelineClosedValue, setPipelineClosedValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getPipelines(subaccountId)
      setPipelines(res)
      setselectedPipelineId(res[0]?.id)
    }
    fetchData()
  }, [subaccountId])

  const totalPipelineValue = useMemo(() => {
    if (pipelines.length) {
      return (
        pipelines
          .find((pipeline) => pipeline.id === selectedPipelineId)
          ?.Lane?.reduce((totalLanes, lane, currentLaneIndex, array) => {
            const laneTicketsTotal = lane.Tickets.reduce(
              (totalTickets, ticket) => totalTickets + Number(ticket?.value),
              0
            )
            if (currentLaneIndex === array.length - 1) {
              setPipelineClosedValue(laneTicketsTotal || 0)
              return totalLanes
            }
            return totalLanes + laneTicketsTotal
          }, 0) || 0
      )
    }
    return 0
  }, [selectedPipelineId, pipelines])

  const pipelineRate = useMemo(
    () =>
      (pipelineClosedValue / (totalPipelineValue + pipelineClosedValue)) * 100,
    [pipelineClosedValue, totalPipelineValue]
  )

  return (
    <Card className="relative w-full xl:w-[350px]">
      <CardHeader>
        <CardDescription>Hodnota Obchodního Plánu</CardDescription>
        <small className="text-xs text-muted-foreground">
          Progres Obchodního Plánu
        </small>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Uzavřeno {pipelineClosedValue} CZK
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Celkově {totalPipelineValue + pipelineClosedValue} CZK
            </p>
          </div>
        </div>
        <Progress
          color="green"
          value={pipelineRate}
          className="h-2"
        />
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-2">
          Celková hodnota všech Lísků v daném plánu kromě posledního sloupce.
          Poslední sloupec je považován za uzavírací sloupec v každém plánu.
        </p>
        <Select
          value={selectedPipelineId}
          onValueChange={setselectedPipelineId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a pipeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Obchodní Plány</SelectLabel>
              {pipelines.map((pipeline) => (
                <SelectItem
                  value={pipeline.id}
                  key={pipeline.id}
                >
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export default PipelineValue
