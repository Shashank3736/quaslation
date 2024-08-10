"use client"

import { useOrganizationList } from "@clerk/nextjs"
import { useEffect } from "react";

export const SetOrganization = () => {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true
    }
  });

  useEffect(() => {
    if(isLoaded && userMemberships.data && userMemberships.data.length > 0) {
      setActive({ organization: userMemberships.data[0].organization.id })
    }
  },[isLoaded, userMemberships.data, setActive, userMemberships.data?.length])
  return null
}