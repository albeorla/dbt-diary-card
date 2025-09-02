import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import {
  Box,
  Typography,
  Card,
  Chip,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, CheckCircle } from '@mui/icons-material';

export const SKILL_MODULE_LABELS: Record<string, string> = {
  MINDFULNESS: 'Mindfulness',
  DISTRESS_TOLERANCE: 'Distress Tolerance',
  EMOTION_REGULATION: 'Emotion Regulation',
  INTERPERSONAL_EFFECTIVENESS: 'Interpersonal Effectiveness',
};

const moduleColors = {
  MINDFULNESS: '#059669',
  DISTRESS_TOLERANCE: '#dc2626',
  EMOTION_REGULATION: '#7c3aed',
  INTERPERSONAL_EFFECTIVENESS: '#ea580c',
};

const moduleIcons = {
  MINDFULNESS: '🧘',
  DISTRESS_TOLERANCE: '💪',
  EMOTION_REGULATION: '🎭',
  INTERPERSONAL_EFFECTIVENESS: '🤝',
};

type Skill = { id: string; name: string; description: string | null };

export function SkillsCheckList({
  groupedSkills,
  selected,
  onToggle,
  readOnly,
}: {
  groupedSkills: Record<string, Skill[]>;
  selected: string[];
  onToggle: (skillName: string, checked: boolean) => void;
  readOnly?: boolean;
}) {
  const totalSkills = Object.values(groupedSkills).flat().length;
  const selectedCount = selected.length;

  return (
    <Box>
      {/* Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select the DBT skills you practiced today
        </Typography>
        <Chip
          label={`${selectedCount} / ${totalSkills} skills used`}
          color={selectedCount > 0 ? 'primary' : 'default'}
          variant={selectedCount > 0 ? 'filled' : 'outlined'}
          size="small"
        />
      </Box>

      {/* Skills by Module */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(groupedSkills).map(([module, skills]) => {
          const moduleKey = module as keyof typeof moduleColors;
          const color = moduleColors[moduleKey] || '#6b7280';
          const icon = moduleIcons[moduleKey] || '📝';
          const moduleSelectedCount = skills.filter((s) => selected.includes(s.name)).length;
          const hasSelected = moduleSelectedCount > 0;

          return (
            <Accordion
              key={module}
              sx={{
                border: hasSelected ? `2px solid ${color}` : '1px solid',
                borderColor: hasSelected ? color : 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: hasSelected ? 2 : 1,
              }}
              defaultExpanded={hasSelected || selectedCount === 0}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: hasSelected ? `${color}08` : 'transparent',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: hasSelected ? `${color}12` : 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>{icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: hasSelected ? color : 'text.primary',
                      }}
                    >
                      {SKILL_MODULE_LABELS[module] ?? module}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moduleSelectedCount} of {skills.length} skills selected
                    </Typography>
                  </Box>
                  {hasSelected && (
                    <Chip
                      icon={<CheckCircle />}
                      label={moduleSelectedCount}
                      size="small"
                      sx={{
                        backgroundColor: color,
                        color: 'white',
                      }}
                    />
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 1.5,
                  }}
                >
                  {skills.map((skill) => {
                    const isSelected = selected.includes(skill.name);
                    return (
                      <FormControlLabel
                        key={skill.id}
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => onToggle(skill.name, e.target.checked)}
                            disabled={!!readOnly}
                            sx={{
                              color: color,
                              '&.Mui-checked': {
                                color: color,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? color : 'text.primary',
                              }}
                            >
                              {skill.name}
                            </Typography>
                            <InfoIcon
                              title={`${skill.name}: ${skill.description ?? 'DBT skill for emotional regulation and coping'}`}
                            />
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 1,
                          borderRadius: 1,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            backgroundColor: `${color}08`,
                          },
                          backgroundColor: isSelected ? `${color}06` : 'transparent',
                        }}
                      />
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Quick Actions */}
      {selectedCount > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
          <Typography
            variant="body2"
            color="success.dark"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CheckCircle fontSize="small" />
            Great job! You&apos;ve selected {selectedCount} skill{selectedCount !== 1 ? 's' : ''}{' '}
            that helped you today.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SkillsCheckList;
