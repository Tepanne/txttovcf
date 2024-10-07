document.getElementById('uploadFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('txtContentBox').value = e.target.result;
      };
      reader.readAsText(file);
  } else {
      alert('Silakan unggah file TXT yang valid.');
  }
});

document.getElementById('convertTxtToVcfButton').addEventListener('click', function() {
  const txtContent = document.getElementById('txtContentBox').value.trim();
  const adminName = document.getElementById('adminNameInput').value.trim() || 'Admin';
  const navyName = document.getElementById('navyNameInput').value.trim() || 'Navy';
  const anggotaName = document.getElementById('anggotaNameInput').value.trim() || 'Anggota';
  const filename = document.getElementById('vcfFilenameInput').value.trim() || 'kontak';
  const separateAdmin = document.getElementById('separateAdminToggle').checked;
  const numberingEnabled = document.getElementById('numberingToggle').checked;

  if (!txtContent) {
      alert('Isi textarea tidak boleh kosong!');
      return;
  }

  const lines = txtContent.split('\n').map(line => line.trim());
  let vcfContentAdminNavy = '';
  let vcfContentAnggota = '';
  let currentCategory = '';
  let contactIndexAdminNavy = 1;
  let contactIndexAnggota = 1;

  lines.forEach(line => {
      const lowerCaseLine = line.toLowerCase();

      if (['admin', '管理号', '管理', '管理员', '管理號'].includes(lowerCaseLine)) {
          currentCategory = adminName;
          contactIndexAdminNavy = 1; // Reset index for admin
      } else if (['navy', '水軍', '小号', '水军', '水軍'].includes(lowerCaseLine)) {
          currentCategory = navyName;
          contactIndexAdminNavy = 1; // Reset index for navy
      } else if (['anggota', '数据', '客户', '底料', '进群资源'].includes(lowerCaseLine)) {
          currentCategory = anggotaName;
          contactIndexAnggota = 1; // Reset index for anggota
      } else if (line) {
          let phoneNumber = line;
          if (!phoneNumber.startsWith('+')) {
              phoneNumber = '+' + phoneNumber;
          }

          let contactName = currentCategory;
          if (numberingEnabled) {
              const index = currentCategory === adminName || currentCategory === navyName 
                  ? contactIndexAdminNavy 
                  : contactIndexAnggota;
              contactName += `-${String(index).padStart(currentCategory === adminName || currentCategory === navyName ? 2 : 3, '0')}`;
          }

          const vcfEntry = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;

          if (currentCategory === adminName || currentCategory === navyName) {
              vcfContentAdminNavy += vcfEntry;
              contactIndexAdminNavy++;
          } else {
              vcfContentAnggota += vcfEntry;
              contactIndexAnggota++;
          }
      }
  });

  // Simpan file
  if (separateAdmin) {
      if (vcfContentAdminNavy) {
          const blobAdminNavy = new Blob([vcfContentAdminNavy], { type: 'text/vcard' });
          const urlAdminNavy = URL.createObjectURL(blobAdminNavy);
          const aAdminNavy = document.createElement('a');
          aAdminNavy.href = urlAdminNavy;
          aAdminNavy.download = `${filename}_Admin.vcf`;
          aAdminNavy.click();
          URL.revokeObjectURL(urlAdminNavy);
      }
  }

  if (vcfContentAnggota) {
      const blobAnggota = new Blob([vcfContentAnggota], { type: 'text/vcard' });
      const urlAnggota = URL.createObjectURL(blobAnggota);
      const aAnggota = document.createElement('a');
      aAnggota.href = urlAnggota;
      aAnggota.download = `${filename}.vcf`;
      aAnggota.click();
      URL.revokeObjectURL(urlAnggota);
  }
});
