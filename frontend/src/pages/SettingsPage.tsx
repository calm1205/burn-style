import { ExitIcon } from "@radix-ui/react-icons"
import { Button, Separator, Text } from "@radix-ui/themes"
import { useOutletContext } from "react-router"
import type { UserResponse } from "../lib/types"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
}

export const SettingsPage = () => {
  const { user, onLogout } = useOutletContext<OutletContext>()

  return (
    <div className="mx-auto max-w-2xl px-6" style={{ paddingTop: "20vh" }}>
      <h1 className="mb-6 text-2xl font-bold">Setting</h1>

      <Separator size="4" mb="4" />

      <div className="mb-6">
        <Text size="3" weight="bold" as="p" mb="2">
          Account
        </Text>
        <Text size="2" color="gray" as="p">
          Username: {user?.name ?? "---"}
        </Text>
      </div>

      <Separator size="4" mb="4" />

      <Button variant="outline" color="red" onClick={onLogout}>
        <ExitIcon />
        Logout
      </Button>
    </div>
  )
}
