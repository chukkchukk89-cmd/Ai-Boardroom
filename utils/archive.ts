import { ArchivedSession, SessionLogEntry } from '../types';
import { getFromCache, setInCache } from './cache';

const ARCHIVE_KEY = 'session_archive';

/**
 * Retrieves all archived sessions from localStorage.
 * @returns An array of archived sessions.
 */
export function getArchive(): ArchivedSession[] {
    return getFromCache<ArchivedSession[]>(ARCHIVE_KEY) || [];
}

/**
 * Saves a completed session to the archive in localStorage.
 * @param sessionData The data for the session to be archived.
 */
export function saveToArchive(sessionData: { goal: string; finalPlan: string | null; log: SessionLogEntry[] }) {
    const archive = getArchive();
    const newEntry: ArchivedSession = {
        ...sessionData,
        id: `session_${Date.now()}`,
        timestamp: Date.now(),
    };
    
    // Limit archive size to prevent localStorage from getting too big
    const MAX_ARCHIVE_SIZE = 20;
    archive.push(newEntry);
    while (archive.length > MAX_ARCHIVE_SIZE) {
        archive.shift(); // Remove the oldest entry
    }

    setInCache(ARCHIVE_KEY, archive);
}
