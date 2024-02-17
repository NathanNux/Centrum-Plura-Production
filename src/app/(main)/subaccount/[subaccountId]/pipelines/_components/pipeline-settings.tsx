'use client'
import React from 'react'
import PipelineInfobar from './pipeline-infobar'
import { Pipeline } from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { deletePipeline, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Smazat Obchodí Plán</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jste si opravdu jisti?</AlertDialogTitle>
              <AlertDialogDescription>
                Tato akce nelze vrátit. Tímto se smaže obchodní plán a všechna
                data související s ním.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Zrušit</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    // Create a new notification
                    await saveActivityLogsNotification({
                      agencyId: undefined, // replace with the actual agency ID
                      description: `Obchodní plán smazán | ${pipelineId}`, // replace with the actual pipeline ID or name
                      subaccountId, // replace with the actual subaccount ID
                    })
                    await deletePipeline(pipelineId)
                    toast({
                      title: 'Smazáno',
                      description: 'Obchodní Plán smazán',
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Opps!',
                      description: 'Obchodní plán nemohl být smazán',
                    })
                  }
                }}
              >
                Smazat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm
          subAccountId={subaccountId}
          defaultData={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings
