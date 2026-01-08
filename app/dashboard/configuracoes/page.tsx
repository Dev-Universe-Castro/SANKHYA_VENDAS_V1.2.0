
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TiposPedidoManager from "@/components/tipos-pedido-manager"
import TabelasPrecosConfigManager from "@/components/tabelas-precos-config-manager"
import ConfiguracoesGerais from "@/components/configuracoes-gerais"
import AccessManagement from "@/components/access-management"
import { toast } from "sonner"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Primeiro tenta pegar do localStorage
        const storedUser = localStorage.getItem('currentUser')
        let userData = null

        if (storedUser) {
          userData = JSON.parse(storedUser)
        } else {
          // Se não tiver no localStorage, tenta pegar do cookie
          const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='))

          if (!userCookie) {
            toast.error("Acesso negado. Faça login novamente.")
            router.push('/login')
            return
          }

          const cookieValue = userCookie.split('=')[1]
          userData = JSON.parse(decodeURIComponent(cookieValue))
        }

        const role = userData.role || userData.FUNCAO || ''
        const isAdminUser = role === 'Administrador' || role === 'ADMIN'
        
        if (!isAdminUser) {
          toast.error("⚠️ Acesso negado. Apenas administradores podem acessar as configurações.")
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Erro ao verificar permissão:', error)
        toast.error("Erro ao verificar permissão. Faça login novamente.")
        router.push('/login')
      }
    }

    checkAdminAccess()
  }, [router])

  // Garantir que dados do prefetch estejam no cache
  useEffect(() => {
    if (!isAdmin) return

    const verificarCache = () => {
      const cached = sessionStorage.getItem('cached_tiposPedido')
      if (!cached) {
        console.log('⚠️ Cache de tipos de pedido não encontrado no sessionStorage')
      } else {
        console.log('✅ Cache de tipos de pedido encontrado')
      }
    }
    
    verificarCache()
  }, [isAdmin])

  // Mostrar loading enquanto verifica permissão
  if (isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Se não for admin, não renderizar nada (será redirecionado)
  if (!isAdmin) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header - Desktop */}
        <div className="hidden md:block border-b p-6">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Header - Mobile */}
        <div className="md:hidden border-b px-3 py-3">
          <h1 className="text-lg font-bold">Configurações</h1>
          <p className="text-xs text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Tabs defaultValue="tipos-pedido" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="tipos-pedido">Tipos de Pedido</TabsTrigger>
              <TabsTrigger value="tabelas-precos">Tabelas de Preços</TabsTrigger>
              <TabsTrigger value="acessos">Acessos</TabsTrigger>
              <TabsTrigger value="geral">Geral</TabsTrigger>
            </TabsList>

            <TabsContent value="tipos-pedido">
              <TiposPedidoManager />
            </TabsContent>

            <TabsContent value="tabelas-precos">
              <TabelasPrecosConfigManager />
            </TabsContent>

            <TabsContent value="acessos">
              <AccessManagement />
            </TabsContent>

            <TabsContent value="geral">
              <ConfiguracoesGerais />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
