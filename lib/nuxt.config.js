module.exports = {
    head:  {
        title: 'JDE, la gagne!',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: '...' },
            { hid: 'description', name: 'description', content: '...' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.png?v=3' },
            { rel: "stylesheet", type: "text/css", href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" }
        ],
        script: [
            { src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' },
            { src: 'https://code.jquery.com/jquery-3.3.1.slim.min.js' },
            { src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' }
        ]
    },
    env: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
    plugins: [{ src: '~/plugins/datatable', ssr: false }]
}