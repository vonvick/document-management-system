/* eslint import/no-unresolved: 0 */
import db from '../../models/';
import ErrorHandler from '../helpers/ErrorHandler';
import DocumentHelper from '../helpers/DocumentHelper';

const Roles = {
  /**
  * Create Role
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  create(req, res) {
    db.Role.find({
      where: {
        title: req.body.title
      }
    }).then((result) => {
      if (result) {
        return res.status(409).json({ message: 'Role already exists' });
      }

      db.Role.create(req.body)
        .then(role => res.status(201).json(role))
        .catch(() => res.status(400).json({ message: 'title cannot be empty ' }));
    });
  },

  /**
  * Get a Role
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getOne(req, res) {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result < 1) {
        return res.status(404).json({ message: 'Role not found' });
      }
      return res.status(200).json(result);
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Get all Roles
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getAll(req, res) {
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : null;
    query.offset = (req.query.offset > 0) ? req.query.offset : null;
    query.order = [['createdAt', 'DESC']];

    db.Role.findAndCountAll(query)
      .then((result) => {
        const offset = query.offset;
        const limit = query.limit;

        const pagination = DocumentHelper.paginateResult(result, offset, limit);
        return res.status(200)
          .json({
            result: result.rows,
            count: result.count,
            pagination
          });
      })
      .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Update a Role
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  update(req, res) {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result && result.title === 'admin') {
        return res.status(403).json({ message: 'can\'t update admin role' });
      }
      db.Role.findById(roleId).then((role) => {
        if (!role) {
          return res.status(404).json({ message: 'role not found to update' });
        }
        role.update(req.body)
          .then(updatedRole => res.status(200)
            .json({ updatedRole, message: 'role updated successfully' }));
      })
      .catch(error => ErrorHandler.processError(res, 500, error));
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Delete a Role
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  delete(req, res) {
    const roleId = req.params.id;
    db.Role.findById(roleId).then((result) => {
      if (result && result.title === 'admin') {
        return res.status(403).json({ message: 'can\'t delete admin role' });
      }
      db.Role.destroy({
        where: {
          id: roleId
        }
      }).then((role) => {
        if (role < 1) {
          return res.status(404).json({ message: 'No role found to delete' });
        }
        return res.status(200).json({ message: 'Role successfully deleted' });
      })
      .catch(error => ErrorHandler.processError(res, 500, error));
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  }
};

export default Roles;
