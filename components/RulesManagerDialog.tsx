import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useExpenseStore } from '@/store';
import { PatternType, CategorizationRule } from '@/types';
import { getAllCategories } from '@/lib/categorization';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RulesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RulesManagerDialog({ open, onOpenChange }: RulesManagerDialogProps) {
  const customRules = useExpenseStore((state) => state.customRules);
  const addRule = useExpenseStore((state) => state.addRule);
  const updateRule = useExpenseStore((state) => state.updateRule);
  const deleteRule = useExpenseStore((state) => state.deleteRule);
  const recategorizeTransactions = useExpenseStore((state) => state.recategorizeTransactions);

  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    patternType: PatternType;
    patterns: string;
    targetCategory: string;
    priority: number;
  }>({
    name: '',
    patternType: 'contains',
    patterns: '',
    targetCategory: 'Other',
    priority: 10,
  });

  const categories = getAllCategories();

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingRuleId(null);
    setFormData({
      name: '',
      patternType: 'contains',
      patterns: '',
      targetCategory: 'Other',
      priority: 10,
    });
  };

  const handleStartEdit = (rule: CategorizationRule) => {
    setIsEditing(true);
    setEditingRuleId(rule.id);
    setFormData({
      name: rule.name,
      patternType: rule.patternType,
      patterns: rule.patterns.join(', '),
      targetCategory: rule.targetCategory,
      priority: rule.priority,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.patterns) {
      alert('Please fill in all required fields');
      return;
    }

    const patterns = formData.patterns
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (patterns.length === 0) {
      alert('Please provide at least one pattern');
      return;
    }

    if (editingRuleId) {
      updateRule(editingRuleId, {
        name: formData.name,
        patternType: formData.patternType,
        patterns,
        targetCategory: formData.targetCategory,
        priority: formData.priority,
      });
    } else {
      addRule({
        name: formData.name,
        patternType: formData.patternType,
        patterns,
        targetCategory: formData.targetCategory,
        priority: formData.priority,
      });
    }

    setIsEditing(false);
    setEditingRuleId(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingRuleId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      deleteRule(id);
    }
  };

  const handleReapplyRules = () => {
    if (confirm('This will recategorize all transactions. Continue?')) {
      recategorizeTransactions();
      alert('Transactions have been recategorized');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Categorization Rules Manager</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Rule Button */}
          {!isEditing && (
            <div>
              <Button onClick={handleStartAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Rule
              </Button>
            </div>
          )}

          {/* Rule Form */}
          {isEditing && (
            <Card className="p-4 border-2 border-blue-200">
              <h3 className="font-semibold mb-4">
                {editingRuleId ? 'Edit Rule' : 'New Rule'}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Rule Name *</Label>
                  <Input
                    placeholder="e.g., Food Delivery Services"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pattern Type</Label>
                    <Select
                      value={formData.patternType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, patternType: value as PatternType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="startsWith">Starts With</SelectItem>
                        <SelectItem value="regex">Regex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Category</Label>
                    <Select
                      value={formData.targetCategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetCategory: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Patterns * (comma-separated)</Label>
                  <Input
                    placeholder="e.g., swiggy, zomato, ubereats"
                    value={formData.patterns}
                    onChange={(e) => setFormData({ ...formData, patterns: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple patterns with commas
                  </p>
                </div>

                <div>
                  <Label>Priority (higher = applied first)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    {editingRuleId ? 'Update Rule' : 'Add Rule'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Rules List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Custom Rules ({customRules.length})</h3>
              {customRules.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleReapplyRules}>
                  Reapply All Rules
                </Button>
              )}
            </div>

            {customRules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No custom rules yet.</p>
                <p className="text-sm mt-2">Add a rule to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customRules
                  .sort((a, b) => b.priority - a.priority)
                  .map(rule => (
                    <Card key={rule.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              Priority: {rule.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rule.patternType}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Patterns:</span>{' '}
                            {rule.patterns.join(', ')}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Category:</span>{' '}
                            <Badge>{rule.targetCategory}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(rule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Built-in Rules Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Built-in Rules
            </p>
            <p className="text-xs text-blue-700">
              The system includes built-in rules for common merchants (Netflix, Swiggy, Uber,
              Amazon, etc.) and MCC codes. Custom rules are applied first based on priority.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
