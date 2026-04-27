import React, { useState, useEffect } from 'react';
import { Hammer, Trash2, Eye, RefreshCcw, CheckCircle, XCircle, Clock, FileCode } from 'lucide-react';
import type { BuildSerializer, ModalState } from '../index';

interface Props {
  builds: BuildSerializer[];
  currentBuild: BuildSerializer | null;
  currentScript: string | null;
  listStatus: string;
  actionStatus: string;
  onListBuilds: () => void;
  onGetBuild: (buildId: string) => void;
  onGetBuildScript: (buildId: string) => Promise<string | null>;
  onCreateBuild: () => void;
  onDeleteBuild: (buildId: string) => Promise<boolean>;
  onPollBuildStatus: (buildId: string) => void;
  onShowModal: (modal: Omit<ModalState, 'show'>) => void;
}

export function BuildTab({
  builds,
  currentScript,
  listStatus,
  actionStatus,
  onListBuilds,
  onGetBuildScript,
  onCreateBuild,
  onDeleteBuild,
  onPollBuildStatus,
  onShowModal,
}: Props) {
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const deletedCount = builds.filter((build) => build.is_deleted).length;
  const visibleBuilds = builds.filter((build) => showDeleted || !build.is_deleted);

  useEffect(() => {
    builds.forEach((build) => {
      if (build.status === 'PENDING') {
        onPollBuildStatus(build.build_id);
      }
    });
  }, [builds, onPollBuildStatus]);

  const handleViewScript = async (buildId: string) => {
    setSelectedBuildId(buildId);
    await onGetBuildScript(buildId);
    setShowScript(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { icon: React.ElementType; className: string }> = {
      PENDING: { icon: Clock, className: 'bg-amber-50 text-amber-600 border-amber-200' },
      COMPLETED: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
      FAILED: { icon: XCircle, className: 'bg-rose-50 text-rose-600 border-rose-200' },
    };
    const { icon: Icon, className } = config[status] || { icon: Clock, className: 'bg-slate-50 text-slate-600 border-slate-200' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${className}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Build History</h4>
          <p className="text-xs text-slate-400 font-medium">Manage widget build versions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onListBuilds}
            disabled={listStatus === 'loading'}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCcw size={20} className={listStatus === 'loading' ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onCreateBuild}
            disabled={actionStatus === 'creating'}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {actionStatus === 'creating' ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <Hammer size={18} />
            )}
            New Build
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            All Builds ({visibleBuilds.length})
          </p>
          {deletedCount > 0 && (
            <button
              onClick={() => setShowDeleted((prev) => !prev)}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              {showDeleted ? 'Hide Deleted' : `Show Deleted (${deletedCount})`}
            </button>
          )}
        </div>

        {visibleBuilds.length > 0 ? (
          <div className="grid gap-4">
            {visibleBuilds.map((build) => (
              <div
                key={build.build_id}
                className={`group relative bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-xl hover:border-slate-300 ${
                  build.is_deleted ? 'opacity-75' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h5 className="font-black text-slate-800 text-sm">
                        Build {build.build_id.slice(0, 8)}...
                      </h5>
                      {build.is_deleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border bg-slate-100 text-slate-600 border-slate-300">
                          <Trash2 size={14} />
                          DELETED
                        </span>
                      ) : (
                        <StatusBadge status={build.status} />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Created: {new Date(build.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!build.is_deleted && (
                      <button
                        onClick={() => handleViewScript(build.build_id)}
                        disabled={build.status !== 'COMPLETED'}
                        className="p-2.5 text-slate-600 bg-slate-100 border border-slate-200 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title="View Script"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {!build.is_deleted && (
                      <button
                        onClick={() =>
                          onShowModal({
                            title: 'Delete Build',
                            message: 'Are you sure you want to delete this build? This cannot be undone.',
                            type: 'confirm',
                            onConfirm: async () => {
                              const ok = await onDeleteBuild(build.build_id);
                              onShowModal(ok
                                ? { title: 'Deleted', message: 'Build marked as deleted successfully.', type: 'success' }
                                : { title: 'Error', message: 'Failed to delete build.', type: 'error' });
                            },
                          })
                        }
                        className="p-2.5 text-slate-600 bg-slate-100 border border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all"
                        title="Delete Build"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <Hammer size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              {builds.length > 0 ? 'No active builds' : 'No builds yet'}
            </p>
          </div>
        )}
      </div>

      {showScript && selectedBuildId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Build Script</h3>
                  <p className="text-xs text-slate-400">Script for build {selectedBuildId.slice(0, 8)}...</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowScript(false);
                  setSelectedBuildId(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              <pre className="bg-[#1e293b] text-slate-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto">
                {currentScript || '// Loading script...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}