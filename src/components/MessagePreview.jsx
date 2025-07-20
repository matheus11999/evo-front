import { useState } from 'react'
import { MessageSquare, Image, FileDown, Send, Smartphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

const MessagePreview = ({ type, content, mediaFile, mediaPreview, groups = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const renderMessageBubble = () => {
    return (
      <div className="relative max-w-sm ml-auto">
        {/* WhatsApp-style message bubble */}
        <div className="bg-green-500 text-white p-3 rounded-xl rounded-br-sm shadow-lg">
          {/* Media content */}
          {type === 'IMAGE' && mediaPreview && (
            <div className="mb-2">
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="w-full max-w-xs rounded-lg"
              />
            </div>
          )}
          
          {type === 'DOCUMENT' && (mediaFile || mediaPreview) && (
            <div className="flex items-center space-x-2 mb-2 p-2 bg-white/20 rounded-lg">
              <FileDown className="h-6 w-6" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {mediaFile ? mediaFile.name : 'Documento anexado'}
                </p>
                <p className="text-xs opacity-75">
                  {mediaFile ? `${(mediaFile.size / 1024 / 1024).toFixed(2)} MB` : 'Arquivo'}
                </p>
              </div>
            </div>
          )}
          
          {/* Text content */}
          {content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {content}
            </p>
          )}
          
          {/* WhatsApp-style timestamp */}
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-75">
              {new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white/75 rounded-full"></div>
              <div className="w-1 h-1 bg-white/75 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Message tail */}
        <div className="absolute -bottom-0 right-0 w-3 h-3 bg-green-500 transform rotate-45 translate-x-1 translate-y-1"></div>
      </div>
    )
  }

  const hasContent = content || mediaPreview || mediaFile

  if (!hasContent) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">Preview da Mensagem</p>
          <p className="text-xs text-center">
            Digite uma mensagem ou adicione mídia para ver o preview
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <span className="text-blue-900">Preview WhatsApp</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? 'Minimizar' : 'Expandir'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone mockup */}
        <div className="bg-gray-900 rounded-2xl p-2 max-w-sm mx-auto">
          {/* Phone header */}
          <div className="bg-gray-800 rounded-t-xl p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {groups.length > 0 ? groups[0] : 'Grupo de Teste'}
                </p>
                <p className="text-gray-400 text-xs">online</p>
              </div>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="bg-gray-100 h-64 overflow-y-auto p-3 space-y-3">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 gap-1 h-full">
                {Array.from({ length: 64 }, (_, i) => (
                  <div key={i} className="bg-gray-500 rounded-full aspect-square"></div>
                ))}
              </div>
            </div>
            
            {/* Sample incoming message */}
            <div className="relative">
              <div className="bg-white p-2 rounded-xl rounded-bl-sm shadow-sm max-w-[70%]">
                <p className="text-xs text-gray-600">Oi! Como vocês estão?</p>
                <span className="text-xs text-gray-400">09:15</span>
              </div>
            </div>
            
            {/* Preview message */}
            <div className="relative">
              {renderMessageBubble()}
            </div>
          </div>
          
          {/* Phone input area */}
          <div className="bg-gray-200 rounded-b-xl p-3 flex items-center space-x-2">
            <div className="flex-1 bg-white rounded-full px-3 py-2">
              <span className="text-xs text-gray-500">Digite uma mensagem...</span>
            </div>
            <button className="bg-green-500 p-2 rounded-full">
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Message info */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Tipo:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {type === 'TEXT' ? 'Texto' : type === 'IMAGE' ? 'Imagem' : 'Documento'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Caracteres:</span>
                <span className="ml-2 text-gray-600">{content ? content.length : 0}</span>
              </div>
            </div>
            
            {groups.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Será enviado para:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {groups.slice(0, 3).map((group, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {group}
                    </span>
                  ))}
                  {groups.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{groups.length - 3} grupos
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MessagePreview