import SignInWithDiscord from "@/components/system/sign-in-discord";

export default function LoginPage({ searchParams }:{ searchParams: { next?: string }}) {
  return (
    <SignInWithDiscord next={searchParams.next || "/"} />
  )
}