import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * New
 * A semantic, accessible issues table inspired by SonarQube. Fixes common SonarQube/ESLint concerns:
 * - Semantic table structure with caption and scoped headers
 * - Extracted constants for mappings (avoids duplication)
 * - Pure presentational, memoized row component to reduce complexity
 * - Stable keys for rows
 * - Defensive/null-safe rendering for optional fields (tags, assignee)
 * - Avoids inline lambdas in lists by precomputing derived values
 * - Small, focused functions with clear responsibilities and JSDoc
 *
 * Usage: <New issues={issuesArray} onRowClick={(issue) => { ... }} />
 */

// Severity to class mapping extracted as constant to avoid duplication and magic strings
const SEVERITY_CLASS = Object.freeze({
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  INFO: 'info',
});

// PUBLIC_INTERFACE
export function SeverityBadge({ severity }) {
  /** Renders a colored badge for the given severity. */
  const sev = (severity || '').toUpperCase();
  const cls = SEVERITY_CLASS[sev] || 'info';
  return <span className={`badge ${cls}`} aria-label={`Severity: ${sev || 'Unknown'}`}>{sev || 'N/A'}</span>;
}
SeverityBadge.propTypes = {
  severity: PropTypes.string,
};

// PUBLIC_INTERFACE
export function StatusTag({ status }) {
  /** Simple status tag presentation (kept neutral for contrast). */
  const text = status || 'Unknown';
  return <span className="status-tag" aria-label={`Status: ${text}`}>{text}</span>;
}
StatusTag.propTypes = {
  status: PropTypes.string,
};

// Row component: memoized to reduce rerenders for large lists
const IssueRow = memo(function IssueRow({ issue, onRowClick, columns }) {
  // Precompute values to avoid inline computations in JSX
  const ruleKey = issue?.ruleKey || '—';
  const message = issue?.message || '—';
  const type = issue?.type || '—';
  const severity = issue?.severity || 'INFO';
  const language = issue?.language || '—';
  const tags = Array.isArray(issue?.tags) ? issue.tags : [];
  const isBug = Boolean(issue?.isBug);
  const effort = issue?.effort || '—';
  const status = issue?.status || 'Open';
  const assignee = issue?.assignee || 'Unassigned';
  const comments = Number.isFinite(issue?.comments) ? issue.comments : 0;

  const handleClick = onRowClick
    ? () => onRowClick(issue)
    : undefined;

  return (
    <tr onClick={handleClick} className={handleClick ? 'row-clickable' : undefined}>
      {columns.rule && (
        <td>
          <a
            href="#"
            onClick={(e) => { if (handleClick) { e.preventDefault(); handleClick(); } }}
            aria-label={`Open issue details for rule ${ruleKey}`}
            title={ruleKey}
          >
            {ruleKey}
          </a>
        </td>
      )}
      {columns.message && (
        <td className="message" title={message}>
          <a
            href="#"
            onClick={(e) => { if (handleClick) { e.preventDefault(); handleClick(); } }}
            aria-label={`Open issue details for message: ${message}`}
          >
            {message}
          </a>
        </td>
      )}
      {columns.type && <td>{type}</td>}
      {columns.severity && (
        <td>
          <SeverityBadge severity={severity} />
        </td>
      )}
      {columns.language && <td>{language}</td>}
      {columns.tags && (
        <td className="tags">
          {tags.length > 0 ? tags.map((t) => (
            <span className="tag" key={t} aria-label={`Tag: ${t}`}>{t}</span>
          )) : '—'}
        </td>
      )}
      {columns.bug && <td aria-label={`Bug: ${isBug ? 'Yes' : 'No'}`}>{isBug ? 'Yes' : 'No'}</td>}
      {columns.effort && <td>{effort}</td>}
      {columns.status && (
        <td>
          <StatusTag status={status} />
        </td>
      )}
      {columns.assignee && <td>{assignee}</td>}
      {columns.comments && <td>{comments}</td>}
    </tr>
  );
});
IssueRow.displayName = 'IssueRow';
IssueRow.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ruleKey: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    severity: PropTypes.string,
    language: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isBug: PropTypes.bool,
    effort: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    assignee: PropTypes.string,
    comments: PropTypes.number,
  }),
  onRowClick: PropTypes.func,
  columns: PropTypes.shape({
    rule: PropTypes.bool,
    message: PropTypes.bool,
    type: PropTypes.bool,
    severity: PropTypes.bool,
    language: PropTypes.bool,
    tags: PropTypes.bool,
    bug: PropTypes.bool,
    effort: PropTypes.bool,
    status: PropTypes.bool,
    assignee: PropTypes.bool,
    comments: PropTypes.bool,
  }).isRequired,
};

// Default columns configuration
const DEFAULT_COLUMNS = Object.freeze({
  rule: true,
  message: true,
  type: true,
  severity: true,
  language: true,
  tags: true,
  bug: true,
  effort: true,
  status: true,
  assignee: true,
  comments: true,
});

// PUBLIC_INTERFACE
export default function New({ issues, onRowClick, columns }) {
  /**
   * Renders a SonarQube-like issues table. Provides sensible defaults and accessibility.
   * @param {Array} issues - Array of issue objects; see IssueRow.propTypes for shape.
   * @param {Function} onRowClick - Optional row click handler receiving the issue object.
   * @param {Object} columns - Optional columns visibility map; defaults to showing all.
   */
  const cols = useMemo(() => ({ ...DEFAULT_COLUMNS, ...(columns || {}) }), [columns]);

  const safeIssues = Array.isArray(issues) ? issues : [];

  return (
    <section className="issues" aria-labelledby="issues-heading">
      <h1 id="issues-heading" className="sr-only">SonarQube Issues</h1>
      <div className="table-wrap">
        <table className="issues-table">
          <caption className="sr-only">List of static analysis issues detected by SonarQube</caption>
          <thead>
            <tr>
              {cols.rule && <th scope="col">Rule</th>}
              {cols.message && <th scope="col">Message</th>}
              {cols.type && <th scope="col">Type</th>}
              {cols.severity && <th scope="col">Severity</th>}
              {cols.language && <th scope="col">Language</th>}
              {cols.tags && <th scope="col">Tags</th>}
              {cols.bug && <th scope="col">Bug</th>}
              {cols.effort && <th scope="col">Effort</th>}
              {cols.status && <th scope="col">Status</th>}
              {cols.assignee && <th scope="col">Assignee</th>}
              {cols.comments && <th scope="col">Comments</th>}
            </tr>
          </thead>
          <tbody>
            {safeIssues.length === 0 ? (
              <tr>
                <td colSpan={Object.values(cols).filter(Boolean).length} className="empty">
                  No issues found.
                </td>
              </tr>
            ) : safeIssues.map((issue) => {
              const key = issue?.id ?? `${issue?.ruleKey || 'rule'}-${issue?.message || 'msg'}-${issue?.assignee || 'none'}`;
              return (
                <IssueRow
                  key={key}
                  issue={issue}
                  onRowClick={onRowClick}
                  columns={cols}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        :root {
          --bg-canvas: #F5F7FB;
          --table-bg: #FFFFFF;
          --table-header-bg: #E8F1FF;
          --table-row-alt: #F5FAFF;
          --border-subtle: #DFE7F0;
          --text-primary: #1F2937;
          --text-secondary: #4B5563;
          --link: #1D4ED8;
          --hover: rgba(29,78,216,0.06);

          --badge-severity-blocker: #AE0000;
          --badge-severity-critical: #D12F2F;
          --badge-severity-major: #E38300;
          --badge-severity-minor: #3B82F6;
          --badge-severity-info: #059669;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .issues { padding: 16px 24px; background: var(--bg-canvas); }
        .table-wrap { overflow-x: auto; background: var(--table-bg); border: 1px solid var(--border-subtle); border-radius: 6px; }
        .issues-table { width: 100%; border-collapse: separate; border-spacing: 0; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: var(--text-primary); min-width: 1024px; }
        .issues-table thead th { background: var(--table-header-bg); font-weight: 600; text-align: left; padding: 8px 12px; position: sticky; top: 0; }
        .issues-table tbody tr:nth-child(even) { background: var(--table-row-alt); }
        .issues-table td { padding: 8px 12px; border-top: 1px solid var(--border-subtle); vertical-align: middle; }
        .issues-table a { color: var(--link); text-decoration: none; }
        .issues-table a:hover { text-decoration: underline; background: var(--hover); }
        .issues-table .message { max-width: 560px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .issues-table .empty { text-align: center; color: var(--text-secondary); padding: 16px 12px; }
        .row-clickable { cursor: pointer; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; color: #fff; font-weight: 600; font-size: 12px; line-height: 1.4; }
        .badge.blocker { background: var(--badge-severity-blocker); }
        .badge.critical { background: var(--badge-severity-critical); }
        .badge.major { background: var(--badge-severity-major); }
        .badge.minor { background: var(--badge-severity-minor); }
        .badge.info { background: var(--badge-severity-info); }
        .tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .tag { display: inline-block; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: 12px; }
        .status-tag { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #EBF5FF; color: #0F3A75; font-weight: 600; font-size: 12px; }
      `}</style>
    </section>
  );
}

New.propTypes = {
  issues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ruleKey: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    severity: PropTypes.string,
    language: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isBug: PropTypes.bool,
    effort: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    assignee: PropTypes.string,
    comments: PropTypes.number,
  })),
  onRowClick: PropTypes.func,
  columns: PropTypes.object,
};

// Provide a small demo dataset for fallback manual preview (not exported)
const demoIssues = [
  { id: 1, ruleKey: 'java:S111', message: 'Add or use a logger instead of printing to stdout', type: 'CODE_SMELL', severity: 'MAJOR', language: 'Java', tags: ['convention'], isBug: false, effort: '10min', status: 'Open', assignee: 'Unassigned', comments: 0 },
  { id: 2, ruleKey: 'js:S222', message: 'Remove this unused variable', type: 'BUG', severity: 'CRITICAL', language: 'JavaScript', tags: ['cleanup'], isBug: true, effort: '5min', status: 'Open', assignee: 'alice', comments: 2 },
];

// PUBLIC_INTERFACE
export function DemoNewTable() {
  /** Minimal demo rendering for local verification without wiring into routes. */
  return <New issues={demoIssues} />;
}
