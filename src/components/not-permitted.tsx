'use client'

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotPermittedComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Alert variant="destructive" className="max-w-md w-full mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access this page or resource.
        </AlertDescription>
      </Alert>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        If you believe this is an error, please contact your administrator or try logging in again.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={() => window.location.href = "/"}>
          Home
        </Button>
      </div>
    </div>
  )
}