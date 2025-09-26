async function getUserRepos() {
    const token = localStorage.getItem('github_token');
    if (!token) return [];

    const resp = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: { 'Authorization': 'token ' + token }
    });

    const data = await resp.json();
    // dataは配列 [{name, full_name, private, ...}, ...]
    return data.map(r => ({ name: r.name, full_name: r.full_name, private: r.private }));
}
