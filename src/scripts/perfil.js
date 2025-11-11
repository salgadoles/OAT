  const banner = document.getElementById('banner');
  const fotoPerfil = document.getElementById('fotoPerfil');
  const inputBanner = document.getElementById('inputBanner');
  const inputFotoPerfil = document.getElementById('inputFotoPerfil');
  const btnBanner = document.getElementById('btnBanner');
  const btnFotoPerfil = document.getElementById('btnFotoPerfil');

  function atualizarImagem(input, target, storageKey) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target.result;
        target.style.backgroundImage = `url('${imageUrl}')`;
        localStorage.setItem(storageKey, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  btnBanner.addEventListener('click', () => inputBanner.click());
  btnFotoPerfil.addEventListener('click', () => inputFotoPerfil.click());
  inputBanner.addEventListener('change', () =>
    atualizarImagem(inputBanner, banner, 'imagemBanner')
  );
  inputFotoPerfil.addEventListener('change', () =>
    atualizarImagem(inputFotoPerfil, fotoPerfil, 'imagemPerfil')
  );

  window.addEventListener('DOMContentLoaded', () => {
    const bannerSalvo = localStorage.getItem('imagemBanner');
    const perfilSalvo = localStorage.getItem('imagemPerfil');

    if (bannerSalvo) {
      banner.style.backgroundImage = `url('${bannerSalvo}')`;
    } else {
      banner.style.backgroundImage = "url('/public/imagens/download (4).jpg')";
    }

    if (perfilSalvo) {
      fotoPerfil.style.backgroundImage = `url('${perfilSalvo}')`;
    } else {
      fotoPerfil.style.backgroundImage = "url('/public/imagens/download (5).jpg')";
    }
  });
