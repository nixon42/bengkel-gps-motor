import { Router } from 'express';
import { 
  DOCS_ROLES, 
  DOCS_MODULES, 
  DOCS_FAQS, 
  DOCS_METADATA,
  searchDocs 
} from '../../src/data/docsContent.js';

const router = Router();

/**
 * GET /api/docs
 * Public endpoint exposing comprehensive documentation and user guide data
 * Supports optional ?q=keyword and ?role=owner|mekanik|kasir|crm
 */
router.get('/', (req, res) => {
  try {
    const { q, role } = req.query;

    if (q || role) {
      const filtered = searchDocs(q || '', role || 'all');
      return res.json({
        success: true,
        roles: DOCS_ROLES,
        modules: filtered.modules,
        faqs: filtered.faqs,
        totalResults: filtered.totalResults,
        meta: DOCS_METADATA
      });
    }

    return res.json({
      success: true,
      roles: DOCS_ROLES,
      modules: DOCS_MODULES,
      faqs: DOCS_FAQS,
      meta: DOCS_METADATA
    });
  } catch (err) {
    console.error('Error in GET /api/docs:', err);
    return res.status(500).json({
      success: false,
      error: 'Gagal memuat dokumentasi aplikasi'
    });
  }
});

/**
 * GET /api/docs/:id
 * Retrieve specific module or FAQ by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const moduleMatch = DOCS_MODULES.find(m => m.id === id || m.slug === id);
    if (moduleMatch) {
      return res.json({
        success: true,
        type: 'module',
        data: moduleMatch
      });
    }

    const faqMatch = DOCS_FAQS.find(f => f.id === id);
    if (faqMatch) {
      return res.json({
        success: true,
        type: 'faq',
        data: faqMatch
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Dokumen atau topik tidak ditemukan'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Gagal memuat detail dokumentasi'
    });
  }
});

export default router;
