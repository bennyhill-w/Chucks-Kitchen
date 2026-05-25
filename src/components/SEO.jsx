import { useEffect } from 'react'

export default function SEO({ title, description, image, url }) {
  useEffect(() => {
    document.title = title || 'Chuks Kitchen — Authentic Nigerian Food Delivery'

    setMeta('description', description || 'Order authentic Nigerian food online. Jollof rice, Egusi soup, Suya and more delivered fresh to your door in Lagos.')

    setMeta('og:title', title || 'Chuks Kitchen')
    setMeta('og:description', description || 'Authentic Nigerian food delivered to your door.')
    setMeta('og:image', image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80')
    setMeta('og:url', url || window.location.href)
    setMeta('og:type', 'website')
    setMeta('og:site_name', 'Chuks Kitchen')

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title || 'Chuks Kitchen')
    setMeta('twitter:description', description || 'Authentic Nigerian food delivered to your door.')
    setMeta('twitter:image', image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80')
  }, [title, description, image, url])

  return null
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[property="${name}"]`) ||
           document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      el.setAttribute('property', name)
    } else {
      el.setAttribute('name', name)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
