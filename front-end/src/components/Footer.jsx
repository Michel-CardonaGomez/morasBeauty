import React from "react";
import "./Footer.css"

function Footer() {
  return (
    <div>
      <footer className="footer">
        <div className="footer-content">
          {/* MARCA */}
          <div className="footer-brand">
            <p className="footer-logo">Moras Beauty</p>

            <p className="footer-slogan">Realza tu belleza natural</p>
          </div>

          {/* UBICACIÓN */}
          <div className="footer-ubicacion">
            <p className="footer-titulo">Ubicación</p>
            <a
              href="https://www.bing.com/maps/search?q=Calle+19+%23+38+A+-+54%2C+Neiva%2C+Colombia"
              target="_blank"
              rel="noreferrer"
            >
              <i className="ti ti-map-pin" aria-hidden="true" />
              Calle 19 # 38A – 54, Neiva, Huila, Colombia
            </a>
            <p>
              <i className="ti ti-clock" aria-hidden="true" />
              Lun — Sáb: 8:00 am – 5:00 pm
            </p>
            <p>
              <i className="ti ti-phone" aria-hidden="true" />
              +57 310 860 7485
            </p>
          </div>

          {/* REDES */}
          <div className="footer-redes">
            <p className="footer-titulo">Síguenos</p>

            <div className="redes-links">
              <a
                href="https://www.instagram.com/moras_beautysalon/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noreferrer"
                className="red-link"
              >
                <i className="ti ti-brand-instagram" aria-hidden="true" />
                Instagram
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61553642741899"
                target="_blank"
                rel="noreferrer"
                className="red-link"
              >
                <i className="ti ti-brand-facebook" aria-hidden="true" />
                Facebook
              </a>

              <a
                href="https://api.whatsapp.com/message/RPPI7S63SZHGP1?autoload=1&app_absent=0"
                target="_blank"
                rel="noreferrer"
                className="red-link"
              >
                <i className="ti ti-brand-whatsapp" aria-hidden="true" />
                WhatsApp
              </a>

              <a
                href="https://www.tiktok.com/@moras_beautysalon?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noreferrer"
                className="red-link"
              >
                <i className="ti ti-brand-tiktok" aria-hidden="true" />
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Moras Beauty · Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
