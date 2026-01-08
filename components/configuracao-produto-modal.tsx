"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Package, ShoppingCart, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface UnidadeVolume {
  CODVOL: string
  DESCRICAO: string
  QUANTIDADE: number
  isPadrao?: boolean
}

export interface ConfiguracaoProduto {
  quantidade: number
  desconto: number
  preco: number
  unidade: string
}

export interface ConfiguracaoProdutoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produto: any | null
  imagemUrl?: string | null
  unidades: UnidadeVolume[]
  configInicial?: Partial<ConfiguracaoProduto>
  onConfirmar: (config: ConfiguracaoProduto) => void
  onVerPrecos?: () => void
  modo?: 'adicionar' | 'editar'
  disabled?: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function ConfiguracaoProdutoModal({
  open,
  onOpenChange,
  produto,
  imagemUrl,
  unidades,
  configInicial,
  onConfirmar,
  onVerPrecos,
  modo = 'adicionar',
  disabled = false
}: ConfiguracaoProdutoModalProps) {
  const [config, setConfig] = useState<ConfiguracaoProduto>({
    quantidade: 1,
    desconto: 0,
    preco: 0,
    unidade: 'UN'
  })

  useEffect(() => {
    if (produto && open) {
      setConfig({
        quantidade: configInicial?.quantidade ?? 1,
        desconto: configInicial?.desconto ?? 0,
        preco: configInicial?.preco ?? produto.preco ?? produto.VLRUNIT ?? 0,
        unidade: configInicial?.unidade ?? produto.UNIDADE ?? 'UN'
      })
    }
  }, [produto, open, configInicial])

  const handleUnidadeChange = (novaUnidade: string) => {
    const volume = unidades.find(u => u.CODVOL === novaUnidade)
    if (volume) {
      const precoBase = configInicial?.preco ?? produto?.preco ?? produto?.VLRUNIT ?? 0
      const precoAjustado = precoBase * (volume.QUANTIDADE || 1)
      setConfig(prev => ({
        ...prev,
        unidade: novaUnidade,
        preco: precoAjustado
      }))
    } else {
      setConfig(prev => ({ ...prev, unidade: novaUnidade }))
    }
  }

  const subtotal = config.preco * config.quantidade
  const total = subtotal * (1 - config.desconto / 100)

  if (!produto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0">
        <div className="flex flex-col max-h-[85vh]">
          {/* Header with Product Info */}
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagemUrl ? (
                  <img 
                    src={imagemUrl} 
                    alt={produto.DESCRPROD}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2">
                  {produto.DESCRPROD}
                </h4>
                <p className="text-sm text-gray-500 mt-1">Cód: {produto.CODPROD}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Estoque: {produto.ESTOQUE || 0} {produto.UNIDADE}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 md:overflow-y-auto">
            <div className="space-y-4">
              {/* Linha de Quantidade e Desconto */}
              <div className="grid grid-cols-2 gap-4">
                {/* Quantidade */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quantidade</Label>
                  <div className="flex items-center border rounded-lg overflow-hidden h-11">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                      className="h-full w-12 rounded-none border-r"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg">
                      {config.quantidade}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfig(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                      className="h-full w-12 rounded-none border-l"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Desconto */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Desconto (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={config.desconto}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      desconto: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                    }))}
                    className="h-11"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Preço Unitário (Somente Leitura) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Preço Unitário (BRL)</Label>
                <Input
                  type="text"
                  readOnly
                  value={formatCurrency(config.preco)}
                  className="h-11 bg-gray-50/50 border-gray-200 text-gray-700 font-medium"
                />
              </div>

              {/* Unidade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Unidade</Label>
                <Select 
                  value={config.unidade} 
                  onValueChange={handleUnidadeChange}
                >
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades && unidades.length > 0 ? (
                      unidades.map((u) => (
                        <SelectItem key={u.CODVOL} value={u.CODVOL}>
                          {u.DESCRICAO}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={produto.UNIDADE || 'UN'}>
                        {produto.UNIDADE || 'UN'} - Unidade Padrão
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabela de Preço */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tabela de Preço</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-14 border-gray-200 px-4 hover:bg-gray-50 transition-colors"
                  onClick={onVerPrecos}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">IA - SUGESTÃO DE PREÇO</span>
                    <span className="font-medium text-gray-600">Histórico de Compra</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Button>
              </div>

              {/* Resumo de Valores */}
              <div className="mt-8 border-t pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-[#2ECC71]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => onConfirmar(config)}
                disabled={disabled}
                className="flex-1 h-11 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold"
              >
                {modo === 'editar' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Adicionar ao Pedido
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
