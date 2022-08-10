const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  //   Menambahkan Album
  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const querySong = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSong = await this._pool.query(querySong);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    } else if (!resultSong.rows.length) {
      return resultAlbum.rows[0];
    }
    const album = resultAlbum.rows[0];
    const result = {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover,
      songs: resultSong.rows,
    };
    return result;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name= $1, year = $2 WHERE id = $3 RETURNING id ',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
