import { useEffect, useMemo, useState } from 'react';
import { Copy, Eye, Loader2, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formService, type Form, type FormField } from '@/services/form.service';
import {
  creditScoreService,
  type CreditScoreFieldRule,
  type CreditScoreRuleType,
} from '@/services/credit-score.service';

type EditorMode = 'create' | 'clone' | 'view';

const resolveDefaultType = (field: FormField): CreditScoreRuleType => {
  const normalized = (field.key || field.type || '').toLowerCase();
  if (normalized === 'radio' || normalized === 'select') return 'single_choice';
  if (normalized === 'checkbox' || normalized === 'multiselect') return 'multi_choice';
  if (normalized === 'number') return 'number_range';
  return 'open_ended';
};

const buildDefaultRule = (field: FormField): CreditScoreFieldRule => {
  const fieldType = resolveDefaultType(field);
  return {
    fieldName: field.name,
    fieldLabel: field.prompt || field.name,
    fieldType,
    openEndedPoints: fieldType === 'open_ended' ? 0 : undefined,
    optionPoints:
      fieldType === 'single_choice' || fieldType === 'multi_choice'
        ? (field.options || []).map((option) => ({
            value: option.value,
            points: 0,
          }))
        : [],
    ranges: fieldType === 'number_range' ? [{ min: 0, max: 0, points: 0 }] : [],
    notes: '',
  };
};

export default function CreditScoreCalculators() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmerForm, setFarmerForm] = useState<Form | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [applyToExistingFarmers, setApplyToExistingFarmers] = useState(false);
  const [rules, setRules] = useState<CreditScoreFieldRule[]>([]);

  const isReadOnly = editorMode === 'view';

  const maxPoints = useMemo(() => {
    return rules.reduce((sum, rule) => {
      if (rule.fieldType === 'open_ended') return sum + Math.max(0, rule.openEndedPoints || 0);
      if (rule.fieldType === 'single_choice') {
        return sum + Math.max(0, ...((rule.optionPoints || []).map((item) => item.points)));
      }
      if (rule.fieldType === 'multi_choice') {
        return sum + (rule.optionPoints || []).reduce((inner, item) => inner + Math.max(0, item.points), 0);
      }
      if (rule.fieldType === 'number_range') {
        return sum + Math.max(0, ...((rule.ranges || []).map((item) => item.points)));
      }
      return sum;
    }, 0);
  }, [rules]);

  const load = async () => {
    try {
      setLoading(true);
      const [form, calculatorVersions] = await Promise.all([
        formService.getFarmerForm(),
        creditScoreService.getCalculatorVersions(),
      ]);
      setFarmerForm(form);
      setVersions(calculatorVersions || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load calculator setup data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    const formFields = (farmerForm?.fields || []) as FormField[];
    setEditorMode('create');
    setSelectedVersion(null);
    setName(`Calculator V${(versions?.[0]?.version || 0) + 1}`);
    setDescription('');
    setApplyToExistingFarmers(false);
    setRules(formFields.map(buildDefaultRule));
    setEditorOpen(true);
  };

  const startView = (version: any) => {
    setEditorMode('view');
    setSelectedVersion(version);
    setName(version.name || '');
    setDescription(version.description || '');
    setApplyToExistingFarmers(false);
    setRules(version?.config?.form?.rules || []);
    setEditorOpen(true);
  };

  const startClone = (version: any) => {
    setEditorMode('clone');
    setSelectedVersion(version);
    setName(`${version.name} (Copy)`);
    setDescription(version.description || '');
    setApplyToExistingFarmers(false);
    setRules(version?.config?.form?.rules || []);
    setEditorOpen(true);
  };

  const updateRule = (index: number, patch: Partial<CreditScoreFieldRule>) => {
    setRules((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const getRangeValidation = (rule: CreditScoreFieldRule) => {
    const ranges = rule.ranges || [];
    if (ranges.length === 0) {
      return { hasInvalidBounds: false, hasOverlap: false };
    }
    const hasInvalidBounds = ranges.some((range) => range.min > range.max);
    const sorted = [...ranges].sort((a, b) => a.min - b.min);
    let hasOverlap = false;
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i - 1].max >= sorted[i].min) {
        hasOverlap = true;
        break;
      }
    }
    return { hasInvalidBounds, hasOverlap };
  };

  const handleCreate = async () => {
    if (isReadOnly) return;
    if (!name.trim()) {
      toast.error('Calculator name is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        setActive: true,
        applyToExistingFarmers,
        config: {
          form: {
            enabled: true,
            formId: farmerForm?._id,
            formVersion: farmerForm?.version || 1,
            rules,
          },
          external: {
            creditBureau: {
              enabled: false,
              status: 'not_applicable' as const,
              weight: 0,
            },
            bankTransactions: {
              enabled: false,
              status: 'not_applicable' as const,
              weight: 0,
            },
          },
        },
      };

      const result = await creditScoreService.createCalculatorVersion(payload);
      if (result?.applyStats) {
        toast.success(
          `Calculator created. Recalculated ${result.applyStats.success}/${result.applyStats.processed} existing farmers.`
        );
      } else {
        toast.success('Calculator version created and activated');
      }
      setEditorOpen(false);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create calculator');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Score Calculators</h1>
          <p className="text-muted-foreground">Versioned, immutable credit score configurations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Version</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version._id} className="border-b">
                    <td className="py-2">v{version.version}</td>
                    <td className="py-2">{version.name}</td>
                    <td className="py-2">
                      {version.isActive ? (
                        <span className="rounded bg-[#ECFDF3] px-2 py-0.5 text-[#027A48]">Active</span>
                      ) : (
                        <span className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[#667085]">Archived</span>
                      )}
                    </td>
                    <td className="py-2">
                      {version.createdAt ? new Date(version.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startView(version)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startClone(version)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {versions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No calculator versions created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editorOpen && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {editorMode === 'create' && 'New Calculator Version'}
                {editorMode === 'clone' && `Clone Version v${selectedVersion?.version}`}
                {editorMode === 'view' && `View Version v${selectedVersion?.version}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Form</label>
                  <Input
                    value={
                      farmerForm
                        ? `${farmerForm.title} (v${farmerForm.version || 1})`
                        : 'No farmer form configured'
                    }
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={isReadOnly} />
              </div>

              {!isReadOnly && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={applyToExistingFarmers}
                    onChange={(e) => setApplyToExistingFarmers(e.target.checked)}
                  />
                  Apply this version to existing farmers after activation
                </label>
              )}

              <div className="rounded-md bg-muted/40 p-3 text-sm">
                Score scale is normalized to <span className="font-semibold">0-10</span>.
                Current configured form max points: <span className="font-semibold">{maxPoints}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule, index) => (
                <div key={rule.fieldName} className="rounded-lg border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{rule.fieldLabel || rule.fieldName}</p>
                      <p className="text-xs text-muted-foreground">{rule.fieldName}</p>
                    </div>
                    <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                      {rule.fieldType === 'open_ended' && 'Open Ended'}
                      {rule.fieldType === 'single_choice' && 'Single Choice'}
                      {rule.fieldType === 'multi_choice' && 'Multiple Choice'}
                      {rule.fieldType === 'number_range' && 'Number Range'}
                      {rule.fieldType === 'not_applicable' && 'Not Applicable'}
                    </div>
                  </div>

                  {rule.fieldType === 'open_ended' && (
                    <div className="max-w-[220px]">
                      <label className="mb-1 block text-xs text-muted-foreground">Points if answered</label>
                      <Input
                        type="number"
                        value={rule.openEndedPoints || 0}
                        disabled={isReadOnly}
                        onChange={(e) => updateRule(index, { openEndedPoints: Number(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {(rule.fieldType === 'single_choice' || rule.fieldType === 'multi_choice') && (
                    <div className="space-y-2">
                      {(rule.optionPoints || []).map((option, optionIndex) => (
                        <div key={`${rule.fieldName}-${option.value}-${optionIndex}`} className="grid gap-2 md:grid-cols-[1fr_160px]">
                          <Input value={option.value} disabled />
                          <Input
                            type="number"
                            value={option.points}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const next = [...(rule.optionPoints || [])];
                              next[optionIndex] = {
                                ...next[optionIndex],
                                points: Number(e.target.value) || 0,
                              };
                              updateRule(index, { optionPoints: next });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {rule.fieldType === 'number_range' && (
                    <div className="space-y-2">
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        Configure bands for numeric answers.
                        <span className="ml-1 font-medium">Example:</span> If value is between 0 and 10, award 2 points.
                      </div>
                      <div className="grid gap-2 text-xs font-medium text-muted-foreground md:grid-cols-4">
                        <span>From (inclusive)</span>
                        <span>To (inclusive)</span>
                        <span>Points</span>
                        <span>Action</span>
                      </div>
                      {(rule.ranges || []).map((range, rangeIndex) => (
                        <div key={`${rule.fieldName}-range-${rangeIndex}`} className="grid gap-2 md:grid-cols-4">
                          <Input
                            type="number"
                            step="any"
                            value={range.min}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const next = [...(rule.ranges || [])];
                              next[rangeIndex] = { ...next[rangeIndex], min: Number(e.target.value) || 0 };
                              updateRule(index, { ranges: next });
                            }}
                          />
                          <Input
                            type="number"
                            step="any"
                            value={range.max}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const next = [...(rule.ranges || [])];
                              next[rangeIndex] = { ...next[rangeIndex], max: Number(e.target.value) || 0 };
                              updateRule(index, { ranges: next });
                            }}
                          />
                          <Input
                            type="number"
                            step="any"
                            value={range.points}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const next = [...(rule.ranges || [])];
                              next[rangeIndex] = { ...next[rangeIndex], points: Number(e.target.value) || 0 };
                              updateRule(index, { ranges: next });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isReadOnly}
                            onClick={() => {
                              const next = (rule.ranges || []).filter((_, idx) => idx !== rangeIndex);
                              updateRule(index, { ranges: next.length ? next : [{ min: 0, max: 0, points: 0 }] });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {(() => {
                        const validation = getRangeValidation(rule);
                        if (!validation.hasInvalidBounds && !validation.hasOverlap) return null;
                        return (
                          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">
                            {validation.hasInvalidBounds
                              ? 'Each range must have "From" less than or equal to "To". '
                              : ''}
                            {validation.hasOverlap ? 'Ranges should not overlap.' : ''}
                          </div>
                        );
                      })()}
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateRule(index, {
                              ranges: [...(rule.ranges || []), { min: 0, max: 0, points: 0 }],
                            })
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Range
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditorOpen(false)}>
                  Close
                </Button>
                {!isReadOnly && (
                  <Button onClick={handleCreate} disabled={saving || rules.length === 0}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Save New Version'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

