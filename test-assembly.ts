// ═══════════════════════════════════════════════════════════════
// TEST-ASSEMBLY.TS — End-to-end test for the assembly pipeline
// Generates a complete HTML file from 5 core templates with sample data
// ═══════════════════════════════════════════════════════════════

import { assembleHTML, type AssemblyConfig, type AssemblyScreen } from './src/lib/templates/assembly';
import { writeFileSync } from 'fs';

// ── Sample data for each core template ────────────────────────

const coverScreen: AssemblyScreen = {
  id: 's-cover',
  templateId: 'cover',
  data: {
    _templateId: 'cover',
    icon: '⚖️',
    title: 'Hakikat Norma',
    subtitle: 'Memahami pengertian, jenis, dan fungsi norma dalam kehidupan bermasyarakat',
    mapel: 'PPKn',
    kelas: 'VII',
    pertemuan: 'Pertemuan 1',
    bab: 'Bab 1',
    durasi: '80',
    fase: 'D',
    elemen: 'Norma dan Keadilan',
    chips: [
      { icon: '📋', label: 'PPKn VII' },
      { icon: '⏱️', label: '80 Menit' },
      { icon: '🎮', label: 'Game Sortir' },
      { icon: '❓', label: '5 Soal Kuis' },
    ],
    ctaText: 'Mulai Pembelajaran',
    accentVar: '--y',
  },
};

const materiScreen: AssemblyScreen = {
  id: 's-materi',
  templateId: 'materi-accordion',
  data: {
    _templateId: 'materi-accordion',
    title: 'Hakikat Norma dalam Kehidupan',
    sections: [
      {
        icon: '📖',
        title: 'Pengertian Norma',
        content: 'Norma adalah aturan atau ketentuan yang mengatur tingkah laku manusia dalam kehidupan bermasyarakat. Norma bersifat mengikat dan memiliki sanksi bagi yang melanggar. Dalam kehidupan sehari-hari, norma menjadi pedoman bagi setiap individu untuk bertindak sesuai dengan nilai-nilai yang berlaku di masyarakat.',
        defBoxes: [
          { text: 'Norma berasal dari bahasa Belanda "norm" yang berarti aturan atau ketentuan. Dalam bahasa Latin, "norma" berarti sudut siku atau penggaris yang menjadi standar ukuran.', accentVar: '--y' },
        ],
        cardGrid: [
          { icon: '📜', title: 'Tertulis', body: 'Norma yang dicantumkan dalam peraturan perundang-undangan', accentVar: '--c' },
          { icon: '🗣️', title: 'Tidak Tertulis', body: 'Norma yang hidup dalam kebiasaan masyarakat', accentVar: '--g' },
        ],
      },
      {
        icon: '⚖️',
        title: 'Ciri-ciri Norma',
        content: 'Norma memiliki beberapa ciri khas yang membedakannya dari aturan biasa. Berikut adalah ciri-ciri utama norma yang berlaku dalam masyarakat:',
        cardGrid: [
          { icon: '🔗', title: 'Mengikat', body: 'Memiliki kekuatan mengikat bagi seluruh anggota masyarakat', accentVar: '--y' },
          { icon: '⚠️', title: 'Bersanksi', body: 'Ada konsekuensi bagi pelanggar norma', accentVar: '--r' },
          { icon: '👥', title: 'Disepakati', body: 'Diterima dan disepakati bersama oleh masyarakat', accentVar: '--g' },
          { icon: '🏠', title: 'Lingkup', body: 'Berlaku dalam lingkup tertentu (negara, agama, masyarakat)', accentVar: '--p' },
        ],
      },
    ],
    defBoxes: [
      { text: 'Norma adalah peraturan atau ketentuan yang mengikat warga masyarakat dalam bertingkah laku, disertai sanksi bagi pelanggarnya.', accentVar: '--y' },
    ],
    diskusiKelompok: [
      { tipe: 1, ikon: '👥', label: 'Diskusi Kelompok 1', judul: 'Mengapa Norma Diperlukan?', isi: 'Diskusikan dengan kelompokmu apa yang terjadi jika masyarakat hidup tanpa norma. Buatlah 3 contoh dampak negatifnya.' },
    ],
    diskusiBox: {
      prompt: 'Menurutmu, norma mana yang paling penting dalam kehidupan sehari-hari? Mengapa?',
      placeholder: 'Tulis jawabanmu...',
      textareaId: 'materi-diskusi-1',
      saveKey: 'materi-diskusi-1',
      saveLabel: 'Diskusi Materi',
      accentVar: '--c',
    },
  },
};

const sortirScreen: AssemblyScreen = {
  id: 's-sortir',
  templateId: 'sortir-game',
  data: {
    _templateId: 'sortir-game',
    title: 'Kelompokkan Jenis Norma',
    items: [
      { text: 'Berhenti saat lampu merah', category: 'Norma Hukum' },
      { text: 'Berdoa sebelum makan', category: 'Norma Agama' },
      { text: 'Mengucapkan terima kasih', category: 'Norma Kesopanan' },
      { text: 'Membayar pajak', category: 'Norma Hukum' },
      { text: 'Berpuasa di bulan Ramadhan', category: 'Norma Agama' },
      { text: 'Tidak berkata kasar', category: 'Norma Kesopanan' },
      { text: 'Mematuhi rambu lalu lintas', category: 'Norma Hukum' },
      { text: 'Menghormati orang yang lebih tua', category: 'Norma Kesopanan' },
    ],
    categories: [
      { name: 'Norma Hukum', color: '#ff6b6b' },
      { name: 'Norma Agama', color: '#a78bfa' },
      { name: 'Norma Kesopanan', color: '#34d399' },
    ],
  },
};

const kuisScreen: AssemblyScreen = {
  id: 's-kuis',
  templateId: 'kuis',
  data: {
    _templateId: 'kuis',
    title: 'Kuis Hakikat Norma',
    kuis: [
      {
        q: 'Apa yang dimaksud dengan norma?',
        opts: [
          'Aturan yang mengatur tingkah laku manusia dalam masyarakat',
          'Hukum yang dibuat oleh pemerintah',
          'Kebiasaan yang dilakukan secara turun-temurun',
          'Perintah dari orang tua',
        ],
        ans: 0,
        ex: 'Norma adalah aturan atau ketentuan yang mengatur tingkah laku manusia dalam kehidupan bermasyarakat, bersifat mengikat, dan memiliki sanksi bagi pelanggarnya.',
      },
      {
        q: 'Berikut ini yang BUKAN merupakan ciri-ciri norma adalah...',
        opts: [
          'Bersifat mengikat',
          'Tidak memiliki sanksi',
          'Disepakati bersama',
          'Berlaku dalam lingkup tertentu',
        ],
        ans: 1,
        ex: 'Norma selalu memiliki sanksi bagi pelanggarnya, baik sanksi sosial maupun sanksi hukum. Jadi "tidak memiliki sanksi" bukan ciri norma.',
      },
      {
        q: 'Norma yang sanksinya berupa dosa atau kutukan termasuk jenis norma...',
        opts: [
          'Norma kesopanan',
          'Norma kesusilaan',
          'Norma agama',
          'Norma hukum',
        ],
        ans: 2,
        ex: 'Norma agama berasal dari Tuhan dan sanksinya bersifat spiritual (dosa/kutukan), meskipun pelaksanaannya diserahkan kepada masing-masing individu.',
      },
      {
        q: 'Norma yang pelanggarannya mendapat sanksi sosial berupa cemoohan atau pengucilan adalah norma...',
        opts: [
          'Norma hukum',
          'Norma kesopanan',
          'Norma agama',
          'Norma kesusilaan',
        ],
        ans: 1,
        ex: 'Norma kesopanan (mores) memiliki sanksi sosial berupa cemoohan, pengucilan, atau dikucilkan dari pergaulan masyarakat.',
      },
      {
        q: 'Apa perbedaan utama antara norma hukum dan norma lainnya?',
        opts: [
          'Norma hukum dibuat oleh negara dan bersifat memaksa',
          'Norma hukum berasal dari Tuhan',
          'Norma hukum tidak memiliki sanksi',
          'Norma hukum hanya berlaku di sekolah',
        ],
        ans: 0,
        ex: 'Norma hukum dibuat oleh negara/pemerintah, bersifat memaksa, dan pelanggarannya dikenai sanksi tegas berupa hukuman sesuai peraturan perundang-undangan.',
      },
    ],
  },
};

const hasilScreen: AssemblyScreen = {
  id: 's-hasil',
  templateId: 'hasil',
  data: {
    _templateId: 'hasil',
    title: 'Hasil Belajar',
    totalKuis: 5,
    namaBab: 'Hakikat Norma',
    score: 0, // will be updated dynamically
    level: '',
  },
};

// ── Assemble the HTML ─────────────────────────────────────────
const config: AssemblyConfig = {
  title: 'Hakikat Norma — PPKn VII Pertemuan 1',
  navbarLogo: '⚖️ Hakikat Norma',
  screens: [coverScreen, materiScreen, sortirScreen, kuisScreen, hasilScreen],
  cssVars: {
    '--y': '#f9c12e',
  },
  includeConfetti: true,
};

try {
  const html = assembleHTML(config);
  const outputPath = '/home/z/my-project/download/test-assembly-output.html';
  writeFileSync(outputPath, html, 'utf-8');
  console.log(`✅ HTML assembled successfully!`);
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Size: ${(html.length / 1024).toFixed(1)} KB`);
  console.log(`🎬 Screens: ${config.screens.map(s => s.id).join(' → ')}`);

  // ── Quality Verification ──────────────────────────────────────
  const checks: [string, boolean][] = [
    ['DOCTYPE present', html.includes('<!DOCTYPE html>')],
    ['Exactly 1 shared navbar', (html.match(/<nav class="navbar"/g) || []).length === 1],
    ['Navbar initially hidden', html.includes('id="navbar" style="display:none"')],
    ['Navbar logo text', html.includes('Hakikat Norma')],
    ['First screen active', html.includes('class="screen active"')],
    ['Cover data-nav-label', html.includes('data-nav-label="Cover"')],
    ['Sortir data-nav-label', html.includes('data-nav-label="Game Sortir"')],
    ['Sortir uses pill-style items', html.includes('sortir-kartu')],
    ['Sortir uses kolom columns', html.includes('sortir-kolom')],
    ['Sortir flyOut animation', html.includes('flyOut')],
    ['Kuis progress dots', html.includes('puzzle-dot')],
    ['Kuis chip-sc header', html.includes('Kuis Pengetahuan')],
    ['Hasil portofolio section', html.includes('hasilPorto')],
    ['Hasil conic-gradient circle', html.includes('conic-gradient')],
    ['Confetti wrapper', html.includes('id="confWrap"')],
    ['Google Fonts loaded', html.includes('fonts.googleapis.com')],
    ['goScreen() function', html.includes('function goScreen')],
    ['addScore() function', html.includes('function addScore')],
    ['launchConfetti() function', html.includes('function launchConfetti')],
    ['saveDiskusi() function', html.includes('function saveDiskusi')],
    ['Navbar show/hide logic in JS', html.includes('navbar.style.display')],
    ['navScene label update', html.includes('data-nav-label')],
    ['No duplicate <nav> in screens', (html.match(/<nav class="navbar"/g) || []).length <= 1],
    ['Progress bar with progFill id', html.includes('id="progFill"')],
    ['Score with navScore id', html.includes('id="navScore"')],
  ];

  console.log('\n═══ QUALITY VERIFICATION ═══');
  let passed = 0, failed = 0;
  for (const [name, result] of checks) {
    console.log((result ? '✅ ' : '❌ ') + name);
    result ? passed++ : failed++;
  }
  console.log(`\n📊 ${passed}/${checks.length} checks passed, ${failed} failed`);
  const navCount = (html.match(/<nav/g) || []).length;
  console.log(`🔍 Total <nav> elements: ${navCount} (expected: 1)`);

} catch (error) {
  console.error('❌ Assembly failed:', error);
  if (error instanceof Error) {
    console.error(error.stack);
  }
}
