<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'

const reservaId = ref<number | null>(null)
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <nav class="h-16 border-b bg-muted/40 flex justify-between items-center px-6">
      <div class="flex items-center gap-3 w-full max-w-md">
        <Input v-model.number="reservaId" type="number" min="1" placeholder="Ingrese número de registro"
          class="w-full pl-3 bg-background" />

        <RouterLink v-if="reservaId" :to="`/registros/${reservaId}`">
          <Button class="bg-green-600 hover:bg-green-700 text-white rounded-md transition cursor-pointer">
            Ir a la reserva {{ reservaId }}
          </Button>
        </RouterLink>

        <div v-if="reservaId" >
          <Button class="bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition cursor-pointer"
            @click.prevent="reservaId = null">
            <Icon icon="tdesign:clear" />
          </Button>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Avatar class="w-9 h-9 border-2 border-border hover:opacity-80 transition cursor-pointer">
            <AvatarImage src="https://i.ytimg.com/vi/ufCEiISO-fI/mqdefault.jpg" alt="Jhonatan" />
            <AvatarFallback>JH</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem>Mi Cuenta</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
          <DropdownMenuItem>Mis Compras</DropdownMenuItem>
          <DropdownMenuItem>Mi Plan</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-red-600">
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>

    <router-view class="p-6" />
  </main>
</template>

<style scoped></style>
