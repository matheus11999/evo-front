import { useState } from 'react'
import { Search, Users, Check, ChevronDown, ChevronUp } from 'lucide-react'

const GroupSelector = ({ groups = [], selectedGroups = [], onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGroups = groups.filter(group => {
    const groupName = group.name || group.subject || group.id || ''
    const groupId = group.id || ''
    const searchLower = searchTerm.toLowerCase()
    
    return groupName.toLowerCase().includes(searchLower) ||
           groupId.toLowerCase().includes(searchLower)
  })

  const handleGroupToggle = (groupId) => {
    const newSelection = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId]
    
    onChange(newSelection)
  }

  const handleSelectAll = () => {
    const allGroupIds = filteredGroups.map(group => group.id)
    const allSelected = allGroupIds.every(id => selectedGroups.includes(id))
    
    if (allSelected) {
      // Deselect all filtered groups
      const newSelection = selectedGroups.filter(id => !allGroupIds.includes(id))
      onChange(newSelection)
    } else {
      // Select all filtered groups
      const newSelection = [...new Set([...selectedGroups, ...allGroupIds])]
      onChange(newSelection)
    }
  }

  const getSelectedGroupNames = () => {
    return selectedGroups
      .map(id => {
        const group = groups.find(g => g.id === id)
        return group ? (group.name || group.subject || group.id) : id
      })
      .filter(Boolean)
  }

  const selectedNames = getSelectedGroupNames()

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Grupos de Destino {required && '*'}
      </label>
      
      {/* Selected Groups Display */}
      {selectedGroups.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedNames.slice(0, 3).map((name, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {name}
              </span>
            ))}
            {selectedNames.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{selectedNames.length - 3} grupos
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {selectedGroups.length === 0 
                ? 'Selecionar grupos...' 
                : `${selectedGroups.length} grupo${selectedGroups.length !== 1 ? 's' : ''} selecionado${selectedGroups.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Select All Button */}
            {filteredGroups.length > 1 && (
              <div className="p-2 border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="w-full text-left px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-2"
                >
                  <div className="w-4 h-4 border border-blue-300 rounded flex items-center justify-center">
                    {filteredGroups.length > 0 && filteredGroups.every(group => selectedGroups.includes(group.id)) && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <span>
                    {filteredGroups.every(group => selectedGroups.includes(group.id))
                      ? 'Desmarcar todos'
                      : 'Selecionar todos'
                    }
                  </span>
                </button>
              </div>
            )}

            {/* Groups List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {groups.length === 0 ? 'Nenhum grupo disponível' : 'Nenhum grupo encontrado'}
                </div>
              ) : (
                filteredGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => handleGroupToggle(group.id)}
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        selectedGroups.includes(group.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedGroups.includes(group.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name || group.subject || group.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {group.participants || group.size || 0} participantes
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {selectedGroups.length > 0 
          ? `${selectedGroups.length} grupo${selectedGroups.length !== 1 ? 's' : ''} selecionado${selectedGroups.length !== 1 ? 's' : ''}`
          : 'Selecione os grupos para envio da campanha'
        }
      </p>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default GroupSelector